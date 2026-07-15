class AIError(Exception):
    """Base exception for all AI operations."""
    pass

class AITimeoutError(AIError):
    """Raised when the AI provider times out."""
    pass

class AIRateLimitError(AIError):
    """Raised when the AI provider rate limit is exceeded."""
    pass

class AIProviderError(AIError):
    """Raised when the AI provider returns a general error."""
    pass

class AICreditExhaustedError(AIError):
    """Raised when the user has insufficient billing credits for the operation."""
    pass
