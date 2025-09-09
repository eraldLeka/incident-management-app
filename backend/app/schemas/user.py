from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.constants import UserRole, UserSector

# Input models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.user
    sector: Optional[UserSector] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Output models
class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str  
    sector: Optional[str] = None  
    created_at: datetime

    class Config:
        from_attributes = True

class SignupResponse(BaseModel):
    message: str
    user_id: int

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    sector: Optional[UserSector] = None
    password: Optional[str] = None
