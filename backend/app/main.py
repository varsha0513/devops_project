import os
import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv

from .database import engine, Base, SessionLocal
from .routes import issues, dashboard
from .seed import seed_demo_data

# Load environment variables
load_dotenv()

logger = logging.getLogger("smart_campus")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database tables and optional dev seeding."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Optional development seed if explicitly enabled in environment
    seed_on_startup = os.getenv("SEED_ON_STARTUP", "false").lower() == "true"
    if seed_on_startup:
        db = SessionLocal()
        try:
            logger.info("Checking if database seeding is needed...")
            seed_demo_data(db, force=False)
        finally:
            db.close()

    yield
    logger.info("Shutting down Smart Campus Issues API...")


app = FastAPI(
    title="Smart Campus Issue Reporting & Management API",
    description=(
        "REST API for reporting, inspecting, transitioning, and resolving campus facility complaints. "
        "Built with FastAPI, SQLite, and SQLAlchemy."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
# Configurable via CORS_ORIGINS env var (comma-separated)
cors_origins_raw = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
)
allowed_origins: List[str] = [
    origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Exception handler for validation errors to return uniform error formatting
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({"field": field, "message": err.get("msg")})
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error in request payload", "errors": errors},
    )


# Generic fallback exception handler to protect against leaking internal stack traces
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact campus facilities support."},
    )


# Health check endpoint
@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint to verify that the service is operational."""
    return {
        "status": "healthy",
        "service": "Smart Campus Issue API",
        "version": "1.0.0",
    }


# Development-only database reseed endpoint
@app.post("/api/dev/reset-seed", tags=["Development"])
def dev_reset_seed(request: Request):
    """Development-only endpoint to safely reset and reseed sample complaints."""
    env = os.getenv("ENVIRONMENT", "development").lower()
    if env == "production":
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Database reset is strictly disabled in production environments."},
        )
    db = SessionLocal()
    try:
        count = seed_demo_data(db, force=True)
        return {"message": "Development database reseeded successfully", "count": count}
    finally:
        db.close()


# Include Routers
app.include_router(issues.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
