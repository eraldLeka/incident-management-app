from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import or_

from app.models import User
from app.database import get_db
from app.schemas import UserRead, UserCreate, UserUpdate
from app.utils.dependencies import get_current_system_admin
from app.utils import hashing
from app.schemas.user import SignupResponse
from app.utils.logger import logger

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

def get_request_id(request: Request):
    return request.headers.get("X-Request-ID", "N/A")




@router.get("/", response_model=List[UserRead])
def get_system_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_system_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, gt=0),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] Fetching users by admin: email={current_admin.email}, id={current_admin.id}, skip={skip}, limit={limit}")
    try:
        users = db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
        logger.info(f"[RequestID={request_id}] Fetched {len(users)} users")
        return users
    except Exception:
        logger.exception(f"[RequestID={request_id}] Error fetching system users")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch users")


@router.post("/create", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_system_admin),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] Creating user by admin: email={current_admin.email}, id={current_admin.id}, new user email={user.email}, role={user.role}, sector={user.sector}")
    logger.debug(f"[RequestID={request_id}] Full user input (without password): { {k:v for k,v in user.dict().items() if k != 'password'} }")
    try:
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            logger.warning(f"[RequestID={request_id}] User creation failed: email {user.email} already exists")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
        
        if user.role.startswith("admin") and not user.sector:
            logger.warning(f"[RequestID={request_id}] Admin role requires sector")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin role requires sector")
        
        if user.role.startswith("admin") and user.sector not in ["Hardware", "Software", "Network", "Security"]:
            logger.warning(f"[RequestID={request_id}] Invalid sector: {user.sector}")
            raise HTTPException(status_code=400, detail="Sector must be one of: Hardware, Software, Network, Security")
        
        hashed_pw = hashing.hash_password(user.password)
        new_user = User(
            name=user.name,
            email=user.email,
            password=hashed_pw,
            role=user.role,
            sector=user.sector,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"[RequestID={request_id}] User created successfully with ID: {new_user.id}, email={new_user.email}")
        return SignupResponse(message="User created successfully", user_id=new_user.id)
    except Exception:
        logger.exception(f"[RequestID={request_id}] Error creating user")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_system_admin),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] Deleting user ID: {user_id} by admin: email={current_admin.email}, id={current_admin.id}")
    try:
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            logger.warning(f"[RequestID={request_id}] User not found with ID: {user_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user.is_active = False
        db.commit()
        logger.info(f"[RequestID={request_id}] User deleted successfully: ID={user.id}, email={user.email}")
        return {"message": "User deleted successfully"}
    except Exception:
        logger.exception(f"[RequestID={request_id}] Error deleting user with ID: {user_id}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting user")


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_system_admin),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] Updating user ID: {user_id} by admin: email={current_admin.email}, id={current_admin.id}")
    logger.debug(f"[RequestID={request_id}] Update payload (without password): { {k:v for k,v in user_data.dict().items() if k != 'password'} }")
    try:
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            logger.warning(f"[RequestID={request_id}] User not found with ID: {user_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        if user_data.email and user_data.email != user.email:
            existing_user = db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                logger.warning(f"[RequestID={request_id}] Email update failed: {user_data.email} already exists")
                raise HTTPException(status_code=400, detail="Email already exists")
        
        if user_data.name:
            user.name = user_data.name
        if user_data.email:
            user.email = user_data.email
        if user_data.role:
            user.role = user_data.role
        if user_data.sector:
            user.sector = user_data.sector
        if user_data.password:
            user.password = hashing.hash_password(user_data.password)
        
        db.commit()
        db.refresh(user)
        logger.info(f"[RequestID={request_id}] User updated successfully: ID={user.id}, email={user.email}")
        return user
    except Exception:
        logger.exception(f"[RequestID={request_id}] Error updating user with ID: {user_id}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating user")


@router.get("/search", response_model=List[UserRead], status_code=status.HTTP_200_OK)
def search_users(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, gt=0),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_system_admin),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] Searching users: query='{q}', admin email={current_admin.email}, id={current_admin.id}, skip={skip}, limit={limit}")
    try:
        users = db.query(User).filter(
            User.is_active == True,
            or_(
                User.name.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%"),
                User.role.ilike(f"%{q}%"),
                User.sector.ilike(f"%{q}%"),
            )
        ).offset(skip).limit(limit).all()
        logger.info(f"[RequestID={request_id}] Search returned {len(users)} users")
        return users
    except Exception:
        logger.exception(f"[RequestID={request_id}] Error searching users")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error searching users")




'''
@router.get("/ping")
def ping():
    return {"message": "pong"}
'''







