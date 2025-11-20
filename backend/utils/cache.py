import redis
import json
import hashlib
from typing import Optional, Any
from config import settings
import logging

logger = logging.getLogger(__name__)


class CacheManager:
    """Redis cache manager for storing analysis results"""

    def __init__(self):
        self.enabled = settings.redis_enabled
        self.client: Optional[redis.Redis] = None

        if self.enabled:
            try:
                self.client = redis.Redis(
                    host=settings.redis_host,
                    port=settings.redis_port,
                    db=settings.redis_db,
                    decode_responses=True,
                    socket_timeout=2,
                    socket_connect_timeout=2
                )
                # Test connection
                self.client.ping()
                logger.info("Redis cache connected successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}. Running without cache.")
                self.enabled = False
                self.client = None

    def _generate_key(self, product_title: str) -> str:
        """Generate cache key from product title"""
        normalized = product_title.lower().strip()
        hash_key = hashlib.md5(normalized.encode()).hexdigest()
        return f"product:analysis:{hash_key}"

    def get(self, product_title: str) -> Optional[dict]:
        """Get cached analysis result"""
        if not self.enabled or not self.client:
            return None

        try:
            key = self._generate_key(product_title)
            cached_data = self.client.get(key)

            if cached_data:
                logger.info(f"Cache HIT for product: {product_title[:50]}")
                return json.loads(cached_data)

            logger.info(f"Cache MISS for product: {product_title[:50]}")
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    def set(self, product_title: str, data: dict) -> bool:
        """Set cache with TTL"""
        if not self.enabled or not self.client:
            return False

        try:
            key = self._generate_key(product_title)
            self.client.setex(
                key,
                settings.cache_ttl,
                json.dumps(data)
            )
            logger.info(f"Cached analysis for product: {product_title[:50]}")
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.enabled or not self.client:
            return False
        try:
            self.client.ping()
            return True
        except:
            return False


# Global cache instance
cache = CacheManager()
