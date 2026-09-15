from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
from app.config.database import db_manager
from app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from app.utils.security import hash_password, verify_password, create_access_token
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserRegister):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    clean_name = payload.name.strip()
    clean_email = str(payload.email).strip().lower()
    clean_password = payload.password.strip()

    # Check existing user
    existing = await db.users.find_one({"email": clean_email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    now = datetime.utcnow()
    user_doc = {
        "name": clean_name,
        "email": clean_email,
        "password_hash": hash_password(clean_password),
        "created_at": now
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    user_resp = UserResponse(
        id=user_id,
        name=clean_name,
        email=clean_email,
        created_at=now
    )

    token = create_access_token({"sub": user_id})
    return Token(access_token=token, user=user_resp)

@router.post("/login", response_model=Token)
async def login_user(payload: UserLogin):
    db = db_manager.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database service unavailable.")

    clean_email = str(payload.email).strip().lower()
    clean_password = payload.password.strip()

    user = await db.users.find_one({"email": clean_email})
    if not user or not verify_password(clean_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user_id = str(user["_id"])
    user_resp = UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        created_at=user.get("created_at", datetime.utcnow())
    )

    token = create_access_token({"sub": user_id})
    return Token(access_token=token, user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user.get("created_at", datetime.utcnow())
    )
