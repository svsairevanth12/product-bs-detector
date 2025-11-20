from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """Application configuration settings"""

    # Pollinations AI
    pollinations_api_token: str = ""
    pollinations_model: str = "searchgpt"
    pollinations_base_url: str = "https://text.pollinations.ai"

    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Redis Configuration
    redis_enabled: bool = True
    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0
    cache_ttl: int = 3600  # 1 hour

    # CORS Configuration
    cors_origins: str = '["*"]'

    # Rate Limiting
    rate_limit_per_minute: int = 20

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from string to list"""
        try:
            return json.loads(self.cors_origins)
        except:
            return ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
