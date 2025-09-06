from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.routers.auth import get_current_user
from app.models import User

def get_current_system_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin_system":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create users"
        )
    return current_user
