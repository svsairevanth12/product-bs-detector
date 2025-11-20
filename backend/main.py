from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import analyze
from config import settings
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="BS Detector API",
    description="Scalable backend for product sentiment analysis using Pollinations AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow extension to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with timing"""
    start_time = time.time()

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {duration:.2f}s - "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )

    return response


# Include routers
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "BS Detector API",
        "version": "1.0.0",
        "status": "running",
        "model": settings.pollinations_model,
        "docs": "/docs",
        "endpoints": {
            "analyze": "/api/v1/analyze",
            "health": "/api/v1/health"
        }
    }


@app.get("/health")
async def health():
    """Simple health check"""
    return {"status": "healthy"}


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred. Please try again."
        }
    )


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting BS Detector API on {settings.api_host}:{settings.api_port}")
    logger.info(f"Using model: {settings.pollinations_model}")
    logger.info(f"Redis caching: {'enabled' if settings.redis_enabled else 'disabled'}")

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level="info"
    )
