# api/models.py
# Description: This file defines SQLModel classes for database tables (Profile and Reading).
# These models represent the structure of the 'profile' and 'reading' tables in the PostgreSQL database.

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

# Model for the 'profile' table
class Profile(SQLModel, table=True):
    __tablename__ = "profile"  # Name of the database table
    
    id: int = Field(primary_key=True)  # Unique identifier for each profile
    user_id: str  # Clerk user ID associated with the profile
    tenant_name: str  # Name of the tenant
    meter_number: str  # Meter number for the profile
    initial_reading: Optional[int] = Field(default=None)  # Initial meter reading (nullable)

# Model for the 'reading' table
class Reading(SQLModel, table=True):
    __tablename__ = "reading"  # Name of the database table
    
    id: int = Field(primary_key=True)  # Unique identifier for each reading
    profile_id: int = Field(foreign_key="profile.id", ondelete="CASCADE")  # Foreign key to Profile
    date: datetime  # Date of the reading
    previous: int  # Previous meter reading value
    current: int  # Current meter reading value
    consumption: int  # Calculated consumption (current - previous)