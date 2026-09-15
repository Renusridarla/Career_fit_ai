import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, resumes, jobs, analysis, tailoring, exports, comparison

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up AI CareerFit FastAPI backend...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down AI CareerFit FastAPI backend...")
    await close_mongo_connection()

app = FastAPI(
    title="AI CareerFit — Evidence-Based Career Readiness API",
    description="Production-grade AI Student Career Readiness & Resume Personalization API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Robust CORS Configuration supporting all local dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(jobs.router)
app.include_router(analysis.router)
app.include_router(tailoring.router)
app.include_router(exports.router)
app.include_router(comparison.router)

@app.get("/")
async def root():
    return {
        "message": "AI CareerFit — Evidence-Based Job Readiness & Resume Personalization API",
        "version": "2.0.0",
        "docs": "/docs",
        "ai_status": "Configured" if settings.AI_API_KEY else "Local Fallback Mode"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
