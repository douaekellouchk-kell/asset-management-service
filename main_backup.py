from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api import auth, users, categories
from app.core.database import engine
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Asset/Inventory Management Service",
    version="1.0.0",
    description="Microservice ERP de gestion des actifs et des stocks",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)

@app.get("/health")
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "service": "asset-management", "db": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "error", "service": "asset-management", "db": str(e)}, 503

@app.get("/debug/config")
def debug_config():
    from app.core.config import settings
    return {
        "SECRET_KEY": settings.SECRET_KEY[:10] + "...",
        "ALGORITHM": settings.ALGORITHM
    }