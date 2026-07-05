import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.models import Base
from app.routes import api_router

# Initialize SQLite database and create all Sprint 1 tables
# This safe model registration pattern imports Base from models/__init__.py
# which aggregates all DB models before running metadata creation.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API foundation for Cognera Resolve Case Resolution Agent",
    version="0.1.0"
)

# Configure CORS permissions for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP development simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the aggregated central api router
app.include_router(api_router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.APP_NAME} Backend API",
        "health_check": "/api/health",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
