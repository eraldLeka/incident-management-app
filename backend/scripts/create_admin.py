#!/usr/bin/env python3
"""
Script to create an admin user for the IT Incident Management System
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User
from app.utils.hashing import hash_password
from app.constants import UserRole, UserSector

def create_admin_user():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@system.com").first()
        if existing_admin:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin_user = User(
            name="System Administrator",
            email="admin@system.com",
            password=hash_password("admin123"), 
            role=UserRole.admin_system.value,
            sector=UserSector.Software.value,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("Admin user created successfully!")
        print(f"Email: {admin_user.email}")
        print("Password: admin123")
        print("Please change the password after first login!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
