import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search for .env in backend directory, then project root
backend_dir = Path(__file__).parent
root_dir = backend_dir.parent

if (backend_dir / ".env").exists():
    load_dotenv(backend_dir / ".env")
elif (root_dir / ".env").exists():
    load_dotenv(root_dir / ".env")
else:
    load_dotenv()


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMMA_MODEL: str = "gemma-2-27b-it"
    GITHUB_TOKEN: str = ""
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    MAX_REPO_FILES: int = 35
    MAX_FILE_SIZE_BYTES: int = 50000
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
