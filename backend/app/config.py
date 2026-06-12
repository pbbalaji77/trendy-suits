import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Trendy Suits AI API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_fashion_key_13579")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: fallback to sqlite locally, otherwise use Postgres URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trendysuits.db")
    
    # Redis configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    class Config:
        case_sensitive = True

settings = Settings()
