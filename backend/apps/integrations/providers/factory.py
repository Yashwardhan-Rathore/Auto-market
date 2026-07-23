from typing import Optional
from .base import BaseSocialProvider
from .facebook import FacebookProvider
from .linkedin import LinkedInProvider
from .x import XProvider
from apps.integrations.models import SocialConnection

from .instagram import InstagramProvider

class ProviderFactory:
    """Factory for instantiating the correct social provider."""
    
    @staticmethod
    def get_provider(platform: str) -> Optional[BaseSocialProvider]:
        platform = platform.upper()
        if platform == SocialConnection.PlatformChoices.FACEBOOK:
            return FacebookProvider()
        elif platform == SocialConnection.PlatformChoices.INSTAGRAM:
            return InstagramProvider()
        elif platform == SocialConnection.PlatformChoices.LINKEDIN:
            return LinkedInProvider()
        elif platform == SocialConnection.PlatformChoices.X:
            return XProvider()
        return None
