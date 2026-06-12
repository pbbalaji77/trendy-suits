import time
import json
import logging
from typing import Optional, Any
from app.config import settings

logger = logging.getLogger("cache_service")

class SimpleCache:
    def __init__(self):
        self.is_redis = False
        self.redis_client = None
        self._local_cache = {} # fallback in-memory dict: {key: (value, expire_timestamp)}
        
        if settings.REDIS_URL:
            try:
                import redis
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                # Test connection
                self.redis_client.ping()
                self.is_redis = True
                logger.info("Connected to Redis successfully.")
            except Exception as e:
                logger.warning(f"Could not connect to Redis, falling back to local memory cache. Error: {e}")
                self.is_redis = False

    def get(self, key: str) -> Optional[Any]:
        if self.is_redis and self.redis_client:
            try:
                val = self.redis_client.get(key)
                if val:
                    return json.loads(val)
            except Exception as e:
                logger.error(f"Redis get error: {e}")
        
        # Local cache fallback
        if key in self._local_cache:
            val, expire = self._local_cache[key]
            if expire is None or expire > time.time():
                return val
            else:
                # Expired
                del self._local_cache[key]
        return None

    def set(self, key: str, value: Any, expire_seconds: int = 300) -> None:
        serialized = json.dumps(value)
        if self.is_redis and self.redis_client:
            try:
                self.redis_client.set(key, serialized, ex=expire_seconds)
                return
            except Exception as e:
                logger.error(f"Redis set error: {e}")
        
        # Local cache fallback
        expire = time.time() + expire_seconds if expire_seconds else None
        self._local_cache[key] = (value, expire)

    def delete(self, key: str) -> None:
        if self.is_redis and self.redis_client:
            try:
                self.redis_client.delete(key)
                return
            except Exception as e:
                logger.error(f"Redis delete error: {e}")
        
        # Local cache fallback
        if key in self._local_cache:
            del self._local_cache[key]

cache = SimpleCache()
