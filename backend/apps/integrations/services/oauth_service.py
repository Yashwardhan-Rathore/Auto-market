import os
import secrets
import logging
from django.core.cache import cache
from datetime import timedelta
from django.utils import timezone
from apps.integrations.models import SocialConnection
from apps.integrations.providers.factory import ProviderFactory

logger = logging.getLogger(__name__)

class OAuthService:
    @staticmethod
    def _get_redirect_uri(platform: str) -> str:
        base_url = os.environ.get("OAUTH_REDIRECT_BASE_URL")
        if not base_url:
            raise ValueError("OAUTH_REDIRECT_BASE_URL environment variable is missing.")
            
        if not base_url.endswith("/"):
            base_url += "/"
            
        redirect_uri = f"{base_url}{platform.lower()}/"
        logger.info(f"Generated redirect URI for {platform}: {redirect_uri}")
        return redirect_uri

    @staticmethod
    def generate_auth_url(user, platform: str) -> str:
        logger.info(f"OAuth started for user {user.id} on platform {platform}")
        
        provider = ProviderFactory.get_provider(platform)
        if not provider:
            logger.error(f"Provider not found for platform: {platform}")
            raise ValueError(f"Provider not found for platform: {platform}")

        state = secrets.token_urlsafe(32)
        cache_key = f"oauth_state_{state}"
        cache.set(cache_key, {"user_id": user.id, "platform": platform}, timeout=600)

        redirect_uri = OAuthService._get_redirect_uri(platform)
        auth_url = provider.get_authorization_url(state, redirect_uri)

        logger.info(f"Generated authorization URL for {platform}.")
        return auth_url

    @staticmethod
    def handle_callback(state: str, code: str, expected_platform: str):
        logger.info(f"Callback received for platform: {expected_platform}")
        
        cache_key = f"oauth_state_{state}"
        state_data = cache.get(cache_key)
        
        try:
            if not state_data:
                logger.warning(f"State validation failed: expired or missing state for {expected_platform}")
                raise ValueError("invalid_state")
                
            if state_data["platform"].lower() != expected_platform.lower():
                logger.warning(f"State platform mismatch. Expected: {expected_platform}, Found: {state_data['platform']}")
                raise ValueError("invalid_platform")
                
            provider = ProviderFactory.get_provider(expected_platform)
            if not provider:
                logger.error(f"Provider unavailable: {expected_platform}")
                raise ValueError("provider_unavailable")
                
            redirect_uri = OAuthService._get_redirect_uri(expected_platform)
            
            logger.info(f"Starting token exchange for {expected_platform}")
            try:
                token_data = provider.exchange_code(code, redirect_uri)
            except Exception as e:
                logger.exception(f"Token exchange failed for {expected_platform}")
                raise ValueError("token_exchange_failed")
            
            from apps.accounts.models import MAUser
            try:
                ma_user = MAUser.objects.get(id=state_data["user_id"])
            except MAUser.DoesNotExist:
                logger.error(f"User mapping failed: MAUser not found for ID {state_data['user_id']}")
                raise ValueError("user_mapping_failed")
            
            logger.info(f"Saving database record for {expected_platform} account ID: {token_data.get('account_id')}")
            
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
            logger.info(f"Database save successful for connection ID: {connection.id}")
            
            return connection
        finally:
            if state_data:
                cache.delete(cache_key)

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
