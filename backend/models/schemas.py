from pydantic import BaseModel, Field
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    """Request schema for product analysis"""
    product_title: str = Field(..., min_length=1, max_length=500, description="Product title to analyze")
    product_url: Optional[str] = Field(None, description="Optional product URL for context")


class AnalysisResponse(BaseModel):
    """Response schema for product analysis"""
    real_score: float = Field(..., ge=0.0, le=5.0, description="Sentiment score from 0.0 to 5.0")
    verdict: str = Field(..., description="Summary verdict about the product")
    dealbreakers: List[str] = Field(default_factory=list, description="List of major issues")
    pros: List[str] = Field(default_factory=list, description="List of positive aspects")
    source_count: int = Field(default=0, description="Number of sources analyzed")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    pollinations_connected: bool
    redis_connected: bool
    model: str


class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    detail: Optional[str] = None
