from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from datetime import datetime
from app.database import Base
from app.constants import UserRole, UserSector

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    
    role = Column(String, nullable=False, default=UserRole.user.value)  
    sector = Column(String, nullable=True) 
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)