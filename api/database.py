# api/database.py
# Description: This file manages database connections and initialization for the FastAPI application.
# It uses SQLAlchemy and SQLModel to interact with a PostgreSQL database hosted on NeonDB.

import os
import logging
from sqlalchemy import create_engine, text
from sqlmodel import SQLModel, Session
from dotenv import load_dotenv

# Configure logging for debugging and monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env.local file
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
logger.info(f"Attempting to load .env.local from: {env_path}")
load_dotenv(env_path)

# Get the database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
logger.info(f"DATABASE_URL loaded: {DATABASE_URL}")

# Validate that DATABASE_URL is set
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env.local")

# Extract the database name from the URL for logging purposes
db_name = DATABASE_URL.split("/")[-1].split("?")[0]
logger.info(f"Database name: {db_name}")

# Create SQLAlchemy engine for database connection
engine = create_engine(DATABASE_URL, echo=True)  # Echo=True for SQL query logging

# Dependency to provide a database session for FastAPI endpoints
def get_db():
    db = Session(engine)  # Create a new session
    try:
        yield db  # Yield the session for use in endpoints
    finally:
        db.close()  # Ensure the session is closed after use

# Function to initialize the database (currently uses Alembic for schema management)
def init_db():
    # Log that automatic schema creation is skipped in favor of Alembic migrations
    logger.info("Skipping automatic schema creation; manage schema with Alembic migrations")
    # Check for existing tables in the database
    with Session(engine) as session:
        tables = session.exec(
            text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profile', 'reading')")
        ).all()
        logger.info(f"Existing tables: {tables}")