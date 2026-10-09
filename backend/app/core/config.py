import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "QualityLens Industrial Decision Platform"
    API_V1_STR: str = "/api"
    ENV: str = os.getenv("ENV", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./qualitylens.db")
    CORS_ORIGINS: list[str] = ["*"]
    LINE_SPEED_MPS: float = 1.2
    ACTUATOR_DISTANCE_M: float = 1.8
    DEADLINE_BUDGET_MS: float = 120.0

    class Config:
        env_file = ".env"

settings = Settings()
