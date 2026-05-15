from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "CodeVision"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/codevision"

    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    JUDGE0_API_URL: str = "https://judge0-ce.p.rapidapi.com"
    JUDGE0_API_KEY: str = ""
    JUDGE0_API_HOST: str = "judge0-ce.p.rapidapi.com"

    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    RATE_LIMIT_RUN_CODE: str = "10/minute"
    RATE_LIMIT_EXPLAIN: str = "30/minute"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://codevision.sailokesh.online",
            "https://codevision-alpha.vercel.app",
            "https://codevision-git-main-sailokeshnelluris-projects.vercel.app",
        ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()