# api/schemas.py
# Description: This file defines Pydantic models for request and response validation.
# It includes validation logic for profile and reading data.

from pydantic import BaseModel, validator
from datetime import datetime
from uuid import UUID
from typing import Optional

# Schema for creating a new profile
class ProfileCreate(BaseModel):
    tenant_name: str  # Name of the tenant
    meter_number: str  # Meter number for the profile

    @validator("tenant_name", "meter_number")
    def check_non_empty(cls, v: str) -> str:
        """Validate that the field is not empty or whitespace."""
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v

# Schema for profile response
class ProfileResponse(BaseModel):
    id: UUID  # Unique identifier for the profile
    user_id: str  # Clerk user ID
    tenant_name: str  # Name of the tenant
    meter_number: str  # Meter number
    last_consumption: Optional[int] = 0  # Last recorded consumption

    class Config:
        from_attributes = True  # Enable ORM mode for SQLModel compatibility

# Schema for creating a new reading
class ReadingCreate(BaseModel):
    date: datetime  # Date of the reading
    previous: int  # Previous meter reading
    current: int  # Current meter reading

    @validator("previous", "current")
    def check_non_negative(cls, v: int) -> int:
        """Validate that the reading value is non-negative."""
        if v < 0:
            raise ValueError("Reading must be non-negative")
        return v

    @validator("current")
    def check_current_gte_previous(cls, v: int, values: dict) -> int:
        """Validate that the current reading is >= previous reading."""
        if "previous" in values and v < values["previous"]:
            raise ValueError("Current reading must be >= previous reading")
        return v

# Schema for reading response
class ReadingResponse(BaseModel):
    id: UUID  # Unique identifier for the reading
    profile_id: UUID  # Associated profile ID
    date: datetime  # Date of the reading
    previous: int  # Previous meter reading
    current: int  # Current meter reading
    consumption: int  # Calculated consumption

    class Config:
        from_attributes = True  # Enable ORM mode for SQLModel compatibility