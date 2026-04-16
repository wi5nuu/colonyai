"""
Custom Exceptions for ColonyAI

Provides domain-specific error classes with proper HTTP status codes
and consistent error response format.
"""

from fastapi import HTTPException, status


class ColonyAIException(HTTPException):
    """Base exception for all ColonyAI errors"""
    pass


class PasswordValidationError(ColonyAIException):
    """Raised when password validation fails"""
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class SessionError(ColonyAIException):
    """Raised when session management operations fail"""
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ResourceNotFoundError(ColonyAIException):
    """Raised when requested resource is not found"""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ForbiddenError(ColonyAIException):
    """Raised when user lacks required permissions"""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ConflictError(ColonyAIException):
    """Raised when resource conflict occurs (e.g., duplicate email)"""
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class RateLimitExceededError(ColonyAIException):
    """Raised when API rate limit is exceeded"""
    def __init__(self, detail: str = "Rate limit exceeded", retry_after: int = 60):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)
        self.retry_after = retry_after
