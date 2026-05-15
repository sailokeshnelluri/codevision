from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

from .config import settings
from .database import engine, Base
from .routes import auth, code, projects

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CodeVision API",
    description="AI-powered code visualization backend",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("CodeVision API started")

app.include_router(auth.router,     prefix="/auth",     tags=["Authentication"])
app.include_router(code.router,     prefix="",          tags=["Code Execution"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "CodeVision API"}