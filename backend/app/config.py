from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "PromptArmor LLM Security API"
    DATABASE_URL: Optional[str] = None
    REDIS_URL: Optional[str] = None
    JWT_SECRET: str = "supersecretjwtkeyforpromptarmor_must_be_changed_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
