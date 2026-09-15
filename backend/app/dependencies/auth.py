from fastapi import Depends, HTTPException, status, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from bson import ObjectId
from app.utils.security import decode_access_token
from app.config.database import db_manager

security = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    token: Optional[str] = Query(None)
) -> dict:
    jwt_token = None
    if credentials and credentials.credentials:
        jwt_token = credentials.credentials
    elif token:
        jwt_token = token

    if not jwt_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(jwt_token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload["sub"]
    db = db_manager.db
    
    if db is None:
        # If DB connection failed on startup, fallback user check
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable."
        )

    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user["id"] = str(user["_id"])
    return user
