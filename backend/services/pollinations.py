import httpx
import json
import logging
from typing import Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)


class PollinationsService:
    """Service for interacting with Pollinations AI API"""

    def __init__(self):
        self.base_url = settings.pollinations_base_url
        self.token = settings.pollinations_api_token
        self.model = settings.pollinations_model
        self.timeout = httpx.Timeout(60.0, connect=10.0)

    async def analyze_product(self, product_title: str, product_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze product using Pollinations AI with search capabilities

        Args:
            product_title: Product name/title to analyze
            product_url: Optional product URL for additional context

        Returns:
            Dictionary with analysis results
        """

        # Construct detailed prompt for analysis
        prompt = self._build_analysis_prompt(product_title, product_url)

        # Use OpenAI-compatible endpoint with JSON mode
        return await self._call_openai_endpoint(prompt)

    def _build_analysis_prompt(self, product_title: str, product_url: Optional[str] = None) -> str:
        """Build comprehensive analysis prompt"""

        url_context = f"\nProduct URL: {product_url}" if product_url else ""

        return f"""You are a cynical consumer investigator analyzing product reviews and sentiment.

Product to analyze: "{product_title}"{url_context}

Your task:
1. Search Reddit, YouTube, independent forums, and tech review sites for real user experiences
2. Identify recurring complaints, failure patterns, and dealbreakers
3. Determine if this is a quality product or generic dropshipped item
4. Look for evidence of fake reviews or astroturfing
5. Find genuine positive aspects mentioned by real users

Provide your analysis in this EXACT JSON format:
{{
    "real_score": <float between 1.0-5.0 based on genuine sentiment>,
    "verdict": "<2-3 sentence summary of whether to buy or avoid>",
    "dealbreakers": ["<specific issue 1>", "<specific issue 2>", ...],
    "pros": ["<genuine positive 1>", "<genuine positive 2>", ...],
    "source_count": <number of sources you found>
}}

Be brutally honest. If you find mostly negative feedback, reflect that in the score.
If there's insufficient information, say so in the verdict.
Focus on factual, verifiable information from real users, not marketing copy."""

    async def _call_openai_endpoint(self, prompt: str) -> Dict[str, Any]:
        """
        Call Pollinations OpenAI-compatible endpoint with JSON mode

        This endpoint supports:
        - OpenAI format
        - JSON response mode
        - Search-augmented models
        """

        url = f"{self.base_url}/openai"

        headers = {
            "Content-Type": "application/json"
        }

        # Add authentication if token is provided
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a product analysis expert. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "max_tokens": 2000
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Calling Pollinations API with model: {self.model}")

                response = await client.post(
                    url,
                    headers=headers,
                    json=payload
                )

                response.raise_for_status()
                data = response.json()

                # Extract content from OpenAI format response
                if "choices" in data and len(data["choices"]) > 0:
                    content = data["choices"][0]["message"]["content"]

                    # Parse JSON response
                    result = json.loads(content)

                    # Validate and normalize response
                    return self._normalize_response(result)
                else:
                    raise ValueError("Invalid response format from Pollinations API")

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from Pollinations API: {e}")
            raise Exception(f"Pollinations API error: {e.response.status_code} - {e.response.text}")
        except httpx.TimeoutException:
            logger.error("Timeout calling Pollinations API")
            raise Exception("Analysis timed out. Please try again.")
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            raise Exception("Failed to parse AI response. Please try again.")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise Exception(f"Analysis failed: {str(e)}")

    def _normalize_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize and validate AI response"""

        # Ensure all required fields exist with defaults
        normalized = {
            "real_score": float(data.get("real_score", 0.0)),
            "verdict": str(data.get("verdict", "Unable to analyze product")),
            "dealbreakers": data.get("dealbreakers", []),
            "pros": data.get("pros", []),
            "source_count": int(data.get("source_count", 0))
        }

        # Clamp score between 0 and 5
        normalized["real_score"] = max(0.0, min(5.0, normalized["real_score"]))

        # Ensure lists are actually lists
        if not isinstance(normalized["dealbreakers"], list):
            normalized["dealbreakers"] = []
        if not isinstance(normalized["pros"], list):
            normalized["pros"] = []

        return normalized

    async def test_connection(self) -> bool:
        """Test if Pollinations API is accessible"""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                # Just ping the base URL
                response = await client.get(f"{self.base_url}/")
                return response.status_code < 500
        except:
            return False


# Global service instance
pollinations_service = PollinationsService()
