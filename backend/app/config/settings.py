import os
from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Security
    JWT_SECRET: str = "super_secret_careerfit_jwt_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "careerfit_db"

    # AI Provider
    AI_PROVIDER: str = "gemini"  # gemini, openai, mock
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
