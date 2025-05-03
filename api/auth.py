# api/auth.py
# Description: This file handles JWT authentication for the FastAPI application using Clerk.
# It verifies user tokens and extracts the user ID for authenticated requests.

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from httpx import AsyncClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from .env.local file
project_root = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=project_root / '.env.local')

# Clerk JWKS endpoint for fetching public keys
JWKS_URL = "https://natural-macaw-21.clerk.accounts.dev/.well-known/jwks.json"

# Initialize HTTPBearer scheme for JWT authentication
bearer_scheme = HTTPBearer()

# Function to fetch JWKS (JSON Web Key Set) from Clerk
async def get_jwks():
    """Fetch JWKS from Clerk's endpoint to get public keys for JWT verification."""
    async with AsyncClient() as client:
        try:
            response = await client.get(JWKS_URL)
            response.raise_for_status()  # Raise an error for bad HTTP status
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch JWKS: {str(e)}")

# Function to verify Clerk JWT token and extract user ID
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """Verify Clerk JWT token and return user_id."""
    token = credentials.credentials  # Extract the token from the Authorization header
    try:
        # Fetch JWKS to get the public key
        jwks = await get_jwks()
        # Find the appropriate key for RS256 algorithm
        key = next((k for k in jwks["keys"] if k["alg"] == "RS256"), None)
        if not key:
            raise HTTPException(status_code=401, detail="No valid RS256 key found in JWKS")
        
        # Decode and verify the JWT with audience and issuer validation
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience="http://localhost:8000",  # Expected audience
            issuer="https://natural-macaw-21.clerk.accounts.dev"  # Expected issuer
        )
        user_id = payload.get("sub")  # Extract user ID from the 'sub' claim
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: Missing sub claim")
        return user_id
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependency to get the current user from the token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """Get current user from token by verifying it."""
    return await verify_token(credentials)