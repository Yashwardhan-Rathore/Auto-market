import os
import secrets
from django.core.cache import cache
from datetime import timedelta
from django.utils import timezone
from apps.integrations.models import SocialConnection
from apps.integrations.providers.factory import ProviderFactory

class OAuthService:
    @staticmethod
    def _get_redirect_uri(platform: str) -> str:
        base_url = os.environ.get("OAUTH_REDIRECT_BASE_URL", "http://localhost:8000/api/integrations/social/callback")
        # Ensure it doesn't end with a slash if it's a base URL, or adjust as needed.
        # But let's assume OAUTH_REDIRECT_BASE_URL is the exact base path.
        return f"{base_url}/{platform.lower()}/"

    @staticmethod
    def generate_auth_url(user, platform: str) -> str:
        provider = ProviderFactory.get_provider(platform)
        if not provider:
            raise ValueError(f"Provider not found for platform: {platform}")

        # Generate a secure state token
        state = secrets.token_urlsafe(32)
        
        # Store state in cache to prevent CSRF, tied to this user and platform
        cache_key = f"oauth_state_{state}"
        cache.set(cache_key, {"user_id": user.id, "platform": platform}, timeout=600) # 10 minutes

        redirect_uri = OAuthService._get_redirect_uri(platform)
        return provider.get_authorization_url(state, redirect_uri)

    @staticmethod
    def handle_callback(state: str, code: str, expected_platform: str):
        # Validate state
        cache_key = f"oauth_state_{state}"
        state_data = cache.get(cache_key)
        
        if not state_data:
            raise ValueError("Invalid or expired state parameter.")
            
        if state_data["platform"].lower() != expected_platform.lower():
            raise ValueError("State platform mismatch.")
            
        # Get provider
        provider = ProviderFactory.get_provider(expected_platform)
        if not provider:
            raise ValueError(f"Provider not found for platform: {expected_platform}")
            
        redirect_uri = OAuthService._get_redirect_uri(expected_platform)
        token_data = provider.exchange_code(code, redirect_uri)
        
        # We need the user
        from apps.accounts.models import MAUser
        ma_user = MAUser.objects.get(id=state_data["user_id"])
        
        # Store connection
        connection, created = SocialConnection.objects.update_or_create(
            user=ma_user,
            platform=expected_platform.upper(),
            platform_account_id=token_data["account_id"],
            defaults={
                "account_name": token_data["account_name"],
                "metadata": token_data.get("metadata", {}),
                "connection_status": SocialConnection.ConnectionStatus.CONNECTED
            }
        )
        
        connection.set_tokens(
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token")
        )
        
        expires_in = token_data.get("expires_in")
        if expires_in:
            connection.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        else:
            connection.token_expires_at = None
            
        connection.save()
        
        # Clear state
        cache.delete(cache_key)
        
        return connection

    @staticmethod
    def disconnect_account(connection_id: str, user):
        connection = SocialConnection.objects.get(id=connection_id, user=user)
        provider = ProviderFactory.get_provider(connection.platform)
        
        if provider:
            access_token = connection.get_access_token()
            if access_token:
                provider.revoke_token(access_token)
                
        connection.delete()
        return True

    @staticmethod
    def validate_connection(connection_id: str, user) -> bool:
        connection = SocialConnection.objects.get(id=connection_id, user=user)
        provider = ProviderFactory.get_provider(connection.platform)
        
        if not provider:
            return False
            
        access_token = connection.get_access_token()
        is_valid = provider.validate_token(access_token)
        
        if not is_valid:
            connection.connection_status = SocialConnection.ConnectionStatus.EXPIRED
            connection.save(update_fields=['connection_status'])
            
        return is_valid
