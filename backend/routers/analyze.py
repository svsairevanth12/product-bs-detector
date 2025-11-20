from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from models.schemas import AnalyzeRequest, AnalysisResponse, ErrorResponse
from services.pollinations import pollinations_service
from utils.cache import cache
import logging
import time
from collections import defaultdict

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple in-memory rate limiting (use Redis in production for distributed systems)
rate_limit_store = defaultdict(list)


def check_rate_limit(ip: str, limit: int = 20, window: int = 60) -> bool:
    """
    Simple rate limiting by IP

    Args:
        ip: Client IP address
        limit: Max requests per window
        window: Time window in seconds

    Returns:
        True if request is allowed, False if rate limited
    """
    now = time.time()

    # Clean old requests
    rate_limit_store[ip] = [
        req_time for req_time in rate_limit_store[ip]
        if now - req_time < window
    ]

    # Check limit
    if len(rate_limit_store[ip]) >= limit:
        return False

    # Add current request
    rate_limit_store[ip].append(now)
    return True


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_product(request: Request, body: AnalyzeRequest):
    """
    Analyze a product using Pollinations AI with search grounding

    This endpoint:
    1. Checks cache for existing analysis
    2. Applies rate limiting
    3. Calls Pollinations AI with search capabilities
    4. Caches result for future requests
    5. Returns structured analysis

    No API key required from users!
    """

    client_ip = request.client.host if request.client else "unknown"

    # Rate limiting
    if not check_rate_limit(client_ip, limit=20):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a minute and try again."
        )

    product_title = body.product_title.strip()

    if not product_title:
        raise HTTPException(status_code=400, detail="Product title is required")

    logger.info(f"Analysis request from {client_ip}: {product_title[:50]}")

    # Check cache first
    cached_result = cache.get(product_title)
    if cached_result:
        logger.info("Returning cached result")
        return AnalysisResponse(**cached_result)

    try:
        # Call Pollinations AI
        result = await pollinations_service.analyze_product(
            product_title=product_title,
            product_url=body.product_url
        )

        # Cache the result
        cache.set(product_title, result)

        return AnalysisResponse(**result)

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify service status
    """
    from models.schemas import HealthResponse
    from config import settings

    pollinations_ok = await pollinations_service.test_connection()
    redis_ok = cache.is_connected()

    return HealthResponse(
        status="healthy" if pollinations_ok else "degraded",
        pollinations_connected=pollinations_ok,
        redis_connected=redis_ok,
        model=settings.pollinations_model
    )
