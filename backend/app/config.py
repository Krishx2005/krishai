import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from the backend/ directory regardless of CWD
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/queryai"
    allowed_origins: str = "http://localhost:5173"
    anthropic_api_key: str = ""


settings = Settings()
