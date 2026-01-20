"""
Simple in-memory rate limiter using sliding window algorithm.
"""
import time
import logging
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import Request, HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    In-memory rate limiter with sliding window.
    Tracks requests per IP address.
    """
    
    def __init__(self, max_requests: int = 20, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # Dict of IP -> list of request timestamps
        self._requests: Dict[str, list] = defaultdict(list)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, handling proxies."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self, ip: str, current_time: float) -> None:
        """Remove requests outside the current window."""
        cutoff = current_time - self.window_seconds
        self._requests[ip] = [t for t in self._requests[ip] if t > cutoff]
    
    def check_rate_limit(self, request: Request) -> Tuple[bool, int]:
        """
        Check if request is within rate limit.
        Returns (is_allowed, remaining_requests).
        """
        ip = self._get_client_ip(request)
        current_time = time.time()
        
        self._cleanup_old_requests(ip, current_time)
        
        request_count = len(self._requests[ip])
        remaining = max(0, self.max_requests - request_count)
        
        if request_count >= self.max_requests:
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            return False, 0
        
        # Record this request
        self._requests[ip].append(current_time)
        return True, remaining - 1
    
    def get_headers(self, remaining: int) -> dict:
        """Return rate limit headers for response."""
        return {
            "X-RateLimit-Limit": str(self.max_requests),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Window": str(self.window_seconds)
        }


# Global rate limiter instance
rate_limiter = RateLimiter(
    max_requests=settings.RATE_LIMIT_REQUESTS,
    window_seconds=settings.RATE_LIMIT_WINDOW
)


async def check_rate_limit(request: Request) -> None:
    """
    Dependency that checks rate limit and raises 429 if exceeded.
    """
    is_allowed, remaining = rate_limiter.check_rate_limit(request)
    
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "message": f"Too many requests. Limit: {rate_limiter.max_requests} per {rate_limiter.window_seconds}s",
                "retry_after_seconds": rate_limiter.window_seconds
            }
        )
