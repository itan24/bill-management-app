# api/main.py
# Description: This file sets up a FastAPI application for managing user profiles and meter readings.
# It handles authentication, database interactions, and provides RESTful API endpoints.

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select, SQLModel
from typing import List, Optional
from auth import get_current_user  # Custom dependency for user authentication
from database import get_db, init_db  # Database session and initialization
from models import Profile, Reading  # SQLModel database models
import logging
from datetime import datetime
from sqlalchemy.sql import text
from contextlib import asynccontextmanager

# Configure logging for debugging and monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI()

# Enable CORS to allow frontend requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Lifespan event to manage startup and shutdown tasks
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database and log available tables
    init_db()  # Create database tables if they don't exist
    with Session(get_db()) as session:
        tables = session.exec(
            text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name IN ('profile', 'reading')")
        ).all()
        logger.info(f"Tables found: {tables}")
    yield
    # Shutdown: Log application shutdown
    logger.info("Application shutdown")

# Assign lifespan event to the app
app.lifespan = lifespan

# Pydantic models for request and response validation
class ProfileCreate(BaseModel):
    tenant_name: str  # Name of the tenant
    meter_number: str  # Meter number for the profile

class ProfileResponse(BaseModel):
    id: int  # Profile ID
    user_id: str  # Clerk user ID
    tenant_name: str  # Name of the tenant
    meter_number: str  # Meter number
    last_consumption: Optional[int] = None  # Last recorded consumption
    last_reading_date: Optional[str] = None  # Date of the last reading
    initial_reading: Optional[int] = None  # Initial meter reading

class ReadingCreate(BaseModel):
    profile_id: int  # Associated profile ID
    date: str  # Date in "YYYY-MM-DD" format
    previous: int  # Previous meter reading
    current: int  # Current meter reading

class ReadingResponse(BaseModel):
    id: int  # Reading ID
    profile_id: int  # Associated profile ID
    date: str  # Date of the reading
    previous: int  # Previous meter reading
    current: int  # Current meter reading
    consumption: int  # Calculated consumption

class InitialReadingUpdate(BaseModel):
    initial_reading: int  # Initial meter reading to update

# Endpoint to create a new profile for the authenticated user
@app.post("/api/profiles", response_model=ProfileResponse)
async def create_profile(
    profile: ProfileCreate,
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        # Create a new profile with the provided data
        db_profile = Profile(
            user_id=user_id,
            tenant_name=profile.tenant_name,
            meter_number=profile.meter_number,
            initial_reading=None,
        )
        db.add(db_profile)  # Add profile to the database
        db.commit()  # Commit the transaction
        db.refresh(db_profile)  # Refresh the profile object
        logger.info(f"Created profile: {db_profile.id}")
        # Return the created profile in response format
        return ProfileResponse(
            id=db_profile.id,
            user_id=db_profile.user_id,
            tenant_name=db_profile.tenant_name,
            meter_number=db_profile.meter_number,
            last_consumption=None,
            last_reading_date=None,
            initial_reading=None,
        )
    except Exception as e:
        logger.error(f"Error creating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to fetch all profiles for the authenticated user
@app.get("/api/profiles", response_model=List[ProfileResponse])
async def get_profiles(
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        # Fetch all profiles associated with the user
        profiles = db.exec(select(Profile).where(Profile.user_id == user_id)).all()
        profile_responses = []
        for p in profiles:
            # Fetch the latest reading for the profile
            latest_reading = db.exec(
                select(Reading)
                .where(Reading.profile_id == p.id)
                .order_by(Reading.id.desc())
                .limit(1)
            ).first()
            last_consumption = latest_reading.consumption if latest_reading else None
            last_reading_date = latest_reading.date.isoformat() if latest_reading else None
            logger.info(
                f"Profile {p.id}: Latest reading id={latest_reading.id if latest_reading else 'None'}, "
                f"consumption={last_consumption}, date={last_reading_date}"
            )
            # Add profile details to the response list
            profile_responses.append(
                ProfileResponse(
                    id=p.id,
                    user_id=p.user_id,
                    tenant_name=p.tenant_name,
                    meter_number=p.meter_number,
                    last_consumption=last_consumption,
                    last_reading_date=last_reading_date,
                    initial_reading=p.initial_reading,
                )
            )
        logger.info(f"Fetched profiles for user {user_id}: {[p.id for p in profiles]}")
        return profile_responses
    except Exception as e:
        logger.error(f"Error fetching profiles: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to fetch a specific profile by ID
@app.get("/api/profiles/{profile_id}", response_model=ProfileResponse)
async def get_profile(
    profile_id: int,  # Profile ID from URL path
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        # Fetch the profile and verify user ownership
        profile = db.get(Profile, profile_id)
        if not profile or profile.user_id != user_id:
            raise HTTPException(status_code=404, detail="Profile not found or not authorized")
        # Fetch the latest reading for the profile
        latest_reading = db.exec(
            select(Reading)
            .where(Reading.profile_id == profile.id)
            .order_by(Reading.id.desc())
            .limit(1)
        ).first()
        last_consumption = latest_reading.consumption if latest_reading else None
        last_reading_date = latest_reading.date.isoformat() if latest_reading else None
        logger.info(
            f"Profile {profile_id}: Latest reading id={latest_reading.id if latest_reading else 'None'}, "
            f"consumption={last_consumption}, date={last_reading_date}"
        )
        # Return the profile details
        return ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            tenant_name=profile.tenant_name,
            meter_number=profile.meter_number,
            last_consumption=last_consumption,
            last_reading_date=last_reading_date,
            initial_reading=profile.initial_reading,
        )
    except HTTPException as e:
        logger.error(f"HTTP error in get_profile: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to update the initial reading for a profile
@app.patch("/api/profiles/{profile_id}/initial-reading", response_model=ProfileResponse)
async def update_initial_reading(
    profile_id: int,  # Profile ID from URL path
    update: InitialReadingUpdate,  # Request body with initial reading
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        # Fetch the profile and verify user ownership
        profile = db.get(Profile, profile_id)
        if not profile or profile.user_id != user_id:
            raise HTTPException(status_code=404, detail="Profile not found or not authorized")
        
        # Update the initial reading
        profile.initial_reading = update.initial_reading
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Fetch the latest reading for the updated profile
        latest_reading = db.exec(
            select(Reading)
            .where(Reading.profile_id == profile.id)
            .order_by(Reading.id.desc())
            .limit(1)
        ).first()
        last_consumption = latest_reading.consumption if latest_reading else None
        last_reading_date = latest_reading.date.isoformat() if latest_reading else None
        
        logger.info(f"Updated initial reading for profile {profile_id}: {update.initial_reading}")
        # Return the updated profile details
        return ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            tenant_name=profile.tenant_name,
            meter_number=profile.meter_number,
            last_consumption=last_consumption,
            last_reading_date=last_reading_date,
            initial_reading=profile.initial_reading,
        )
    except HTTPException as e:
        logger.error(f"HTTP error in update_initial_reading: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error updating initial reading: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to delete a profile
@app.delete("/api/profiles/{profile_id}", response_model=dict)
async def delete_profile(
    profile_id: int,  # Profile ID from URL path
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        # Fetch the profile and verify user ownership
        profile = db.get(Profile, profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        if profile.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this profile")
        
        # Delete the profile from the database
        db.delete(profile)
        db.commit()
        logger.info(f"Deleted profile {profile_id}")
        
        # Return success message
        return {"status": "success", "message": f"Profile {profile_id} deleted"}
    except HTTPException as e:
        logger.error(f"HTTP error in delete_profile: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error deleting profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to create a new reading for a profile
@app.post("/api/readings", response_model=ReadingResponse)
async def create_reading(
    reading: ReadingCreate,  # Request body with reading data
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        logger.info(f"Received reading request: {reading.dict()}")
        # Verify the profile and user ownership
        profile = db.get(Profile, reading.profile_id)
        logger.info(f"Profile lookup for ID {reading.profile_id}: {'Found' if profile else 'Not found'}")
        if not profile or profile.user_id != user_id:
            raise HTTPException(status_code=404, detail=f"Profile {reading.profile_id} not found or not owned by user {user_id}")
        
        # Parse the date and validate format
        try:
            parsed_date = datetime.fromisoformat(reading.date.replace('Z', '+00:00'))
        except ValueError:
            logger.error(f"Invalid date format: {reading.date}")
            raise HTTPException(status_code=422, detail="Invalid date format, expected YYYY-MM-DD")
        
        # Create a new reading with calculated consumption
        db_reading = Reading(
            profile_id=reading.profile_id,
            date=parsed_date,
            previous=reading.previous,
            current=reading.current,
            consumption=reading.current - reading.previous
        )
        db.add(db_reading)
        db.commit()
        db.refresh(db_reading)
        logger.info(f"Created reading ID {db_reading.id} for profile {reading.profile_id}")
        inserted_reading = db.get(Reading, db_reading.id)
        logger.info(f"Verified reading ID {db_reading.id}: {'Found' if inserted_reading else 'Not found'}")
        # Return the created reading
        return ReadingResponse(
            id=db_reading.id,
            profile_id=db_reading.profile_id,
            date=db_reading.date.isoformat(),
            previous=db_reading.previous,
            current=db_reading.current,
            consumption=db_reading.consumption
        )
    except HTTPException as e:
        logger.error(f"HTTP error in create_reading: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error creating reading: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to fetch all readings for a profile
@app.get("/api/readings", response_model=List[ReadingResponse])
async def get_readings(
    profile_id: int,  # Profile ID from query parameter
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        # Verify the profile and user ownership
        profile = db.get(Profile, profile_id)
        if not profile or profile.user_id != user_id:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Fetch all readings for the profile
        readings = db.exec(select(Reading).where(Reading.profile_id == profile_id)).all()
        logger.info(f"Fetched {len(readings)} readings for profile {profile_id}")
        # Return the readings in response format
        return [
            ReadingResponse(
                id=r.id,
                profile_id=r.profile_id,
                date=r.date.isoformat(),
                previous=r.previous,
                current=r.current,
                consumption=r.consumption
            )
            for r in readings
        ]
    except Exception as e:
        logger.error(f"Error fetching readings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to delete a reading
@app.delete("/api/readings/{reading_id}", response_model=dict)
async def delete_reading(
    reading_id: int,  # Reading ID from URL path
    user_id: str = Depends(get_current_user),  # Get authenticated user ID
    db: Session = Depends(get_db)  # Database session dependency
):
    try:
        # Fetch the reading and verify user ownership
        reading = db.get(Reading, reading_id)
        if not reading:
            raise HTTPException(status_code=404, detail="Reading not found")
        
        profile = db.get(Profile, reading.profile_id)
        if not profile or profile.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this reading")
        
        # Delete the reading from the database
        db.delete(reading)
        db.commit()
        logger.info(f"Deleted reading {reading_id}")
        
        # Return success message
        return {"status": "success", "message": f"Reading {reading_id} deleted"}
    except Exception as e:
        logger.error(f"Error deleting reading: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Test endpoint to verify database connection
@app.get("/api/test-db")
async def test_db(db: Session = Depends(get_db)):
    try:
        # Fetch one profile to test database connectivity
        result = db.exec(select(Profile).limit(1)).all()
        logger.info(f"Test DB: {len(result)} profiles found")
        return {"status": "connected", "data": [r.dict() for r in result]}
    except Exception as e:
        logger.error(f"Error testing database: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Test endpoint to fetch database schema information
@app.get("/api/schema")
async def get_schema(db: Session = Depends(get_db)):
    try:
        # Query to fetch schema information for profile and reading tables
        query = text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name IN ('profile', 'reading')")
        result = db.exec(query).all()
        logger.info(f"Schema tables: {result}")
        # Return schema information in a structured format
        return {"tables": [{"schema": row[0], "name": row[1]} for row in result]}
    except Exception as e:
        logger.error(f"Error fetching schema: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))