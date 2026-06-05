from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from .config import settings
from .database import engine, Base
from .routes import auth, scan, logs

# Initialize database schemas
try:
    Base.metadata.create_all(bind=engine)
    logging.info("Database tables verified/created successfully.")
except Exception as e:
    logging.error(f"Error creating database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade API for LLM Security monitoring, prompt injection detection, and PII scanning.",
    version="1.0.0"
)

# Configure CORS for Dashboard API requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, tags=["Authentication & Keys"])
app.include_router(scan.router, tags=["LLM Security Scanning"])
app.include_router(logs.router, tags=["Dashboard Monitoring"])

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
