from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CodeVision"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/codevision"

    # JWT
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION_USE_LONG_RANDOM_STRING"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Judge0
    JUDGE0_API_URL: str = "https://judge0-ce.p.rapidapi.com"
    JUDGE0_API_KEY: str = ""           # Set in .env
    JUDGE0_API_HOST: str = "judge0-ce.p.rapidapi.com"

    # OpenAI / Anthropic
    OPENAI_API_KEY: str = ""           # Set in .env
    ANTHROPIC_API_KEY: str = ""        # Set in .env
    GROQ_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://codevision.vercel.app",  # Update with your real domain
    ]

    # Rate limiting
    RATE_LIMIT_RUN_CODE: str = "10/minute"
    RATE_LIMIT_EXPLAIN:  str = "30/minute"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
