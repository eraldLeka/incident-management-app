from urllib import response
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from jose import jwt, JWTError
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from app import database, models, schemas
from app.utils import hashing, token
from app.utils.logger import logger
from fastapi.encoders import jsonable_encoder

load_dotenv()

secret_key = os.getenv("SECRET_KEY")
ALGORITHM = "HS256" 
if not secret_key:
    raise RuntimeError("SECRET_KEY is not set in environment variables")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# Dependency to extract request_id from headers
def get_request_id(request: Request):
    return request.headers.get("X-Request-ID", "N/A")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db), request_id: str = Depends(get_request_id)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        logger.debug(f"[RequestID={request_id}][JWT Decode] Decoded payload: {payload}")
        if email is None:
            logger.info(f"[RequestID={request_id}][JWT Decode] Payload missing 'sub'")
            raise credentials_exception
    except JWTError:
        logger.exception(f"[RequestID={request_id}][JWT Decode] JWT decode error")
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        logger.info(f"[RequestID={request_id}][JWT Decode] No user found for email: {email}")
        raise credentials_exception
    return user


class UserInfo(schemas.UserRead):
    pass


class SignupResponse(BaseModel):
    message: str
    user_id: int


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserInfo] = None


@router.post("/login", response_model=LoginResponse)
async def login(
    login_request: schemas.LoginRequest,
    db: Session = Depends(database.get_db),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] Login attempt for email: {login_request.email}")

    try:
        # DB test
        try:
            db_test = db.execute(text("SELECT 1")).scalar()
            logger.info(f"[RequestID={request_id}] Database connection test passed: {db_test}")
        except Exception:
            logger.exception(f"[RequestID={request_id}] Database connection test failed")
            raise HTTPException(status_code=500, detail="Database connection failed")

        # Find user
        user = db.query(models.User).filter(models.User.email == login_request.email).first()
        logger.info(f"[RequestID={request_id}] User found: {user is not None}")

        if user:
            logger.debug(f"[RequestID={request_id}] User role: {user.role}, sector: {user.sector}")

        if not user:
            logger.info(f"[RequestID={request_id}] Login failed: invalid email {login_request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        try:
            is_valid = hashing.verify_password(login_request.password, user.password)
            logger.info(f"[RequestID={request_id}] Password valid: {is_valid} for user email: {login_request.email}")
        except Exception:
            logger.exception(f"[RequestID={request_id}] Error during password verification for user email: {login_request.email}")
            raise HTTPException(
                status_code=500,
                detail="Password verification failed"
            )

        if not is_valid:
            logger.info(f"[RequestID={request_id}] Login failed: invalid password for email {login_request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create tokens
        try:
            access_token = token.create_access_token(data={"sub": user.email})
            refresh_token = token.create_refresh_token({"sub": user.email})
            user_data = schemas.UserRead.from_orm(user)
            logger.info(f"[RequestID={request_id}] Token and user data created successfully for email: {user.email}")
            logger.debug(f"[RequestID={request_id}] Access token payload: {access_token}")
        except Exception:
            logger.exception(f"[RequestID={request_id}] Error creating token or user data for email: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing login"
            )
        
        #Return response with HttpOnly refresh token cookie
        response = JSONResponse(
            content=jsonable_encoder({
                "access_token": access_token,
                "token_type":"bearer",
                "user": user_data
            })
        )
        response.set_cookie(
            key="refresh_token",
            value = refresh_token,
            httponly = True,
            max_age = 7*24*60*60
        )

        logger.info(f"[RequestID={request_id}] Login successful for email: {login_request.email}")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[RequestID={request_id}] Unexpected error during login for email: {login_request.email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


#Refresh endpoint
@router.post("/refresh", response_model=LoginResponse)
def refresh_access_token(request: Request, db: Session = Depends(database.get_db), request_id: str = Depends(get_request_id)):
    try:
        # Get refresh token from cookie
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            logger.info(f"[RequestID={request_id}] No refresh token provided")
            raise HTTPException(status_code=401, detail="No refresh token provided")
        # decode refresh token
        try:
            payload = jwt.decode(refresh_token, secret_key, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if not email:
                logger.info(f"[RequestID={request_id}] Refresh token missing 'sub'")
                raise HTTPException(status_code=401, detail="Invalid refresh token")
        except JWTError:
            logger.exception(f"[RequestID={request_id}] Invalid or expired refresh token")
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
        # get user from db
        try:
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
        except Exception as e:
            logger.exception(f"[RequestID={request_id}] Error fetching user: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
        
        # create new access token
        new_access_token = token.create_access_token({"sub": email})
        user_data = schemas.UserRead.from_orm(user)

        new_refresh_token = token.create_refresh_token({"sub": email})
        

        # create JWTResponse and set cookie for refresh token
        response = JSONResponse(
            content={
                "access_token": new_access_token,
                "token_type": "bearer",
                "user": user_data.dict()
            }
        )

        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            max_age=7*24*60*60  # 7 ditë
        )

        logger.info(f"[RequestID={request_id}] Access token refreshed for user: {email}")
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[RequestID={request_id}] Unexpected error in refresh endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")





















@router.get("/me", response_model=UserInfo)
def get_current_user_info(
    current_user: models.User = Depends(get_current_user),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] Fetching current user info: email={current_user.email}, id={current_user.id}")
    return current_user





from fastapi import FastAPI

app = FastAPI()

@app.get("/login/ping")
async def ping():
    return {"status": "ok", "message": "Backend is alive"}
