import os
import requests
from typing import Dict, Any
from .base import BaseSocialProvider

class InstagramProvider(BaseSocialProvider):
    """
    Implements Instagram OAuth using the dedicated Instagram Login.
    """
    AUTHORIZE_URL = "https://api.instagram.com/oauth/authorize"
    ACCESS_TOKEN_URL = "https://api.instagram.com/oauth/access_token"
    # To get long-lived token and user info, we use graph.instagram.com
    GRAPH_URL = "https://graph.instagram.com/v20.0" 
    
    def __init__(self):
        self.client_id = os.environ.get("INSTAGRAM_CLIENT_ID", "")
        self.client_secret = os.environ.get("INSTAGRAM_CLIENT_SECRET", "")

    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        # Scopes required for Business/Creator accounts for publishing
        scopes = "instagram_business_basic,instagram_business_content_publish"
        return f"{self.AUTHORIZE_URL}?client_id={self.client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scopes}&state={state}"

    def exchange_code(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        # 1. Exchange code for short-lived access token
        resp = requests.post(self.ACCESS_TOKEN_URL, data={
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
            "code": code
        })
        resp.raise_for_status()
        data = resp.json()
        short_lived_token = data.get("access_token")

        # 2. Exchange for long-lived token
        ll_resp = requests.get(f"{self.GRAPH_URL}/access_token", params={
            "grant_type": "ig_exchange_token",
            "client_secret": self.client_secret,
            "access_token": short_lived_token
        })
        ll_resp.raise_for_status()
        ll_data = ll_resp.json()
        access_token = ll_data.get("access_token")
        expires_in = ll_data.get("expires_in")

        # 3. Fetch user profile
        me_resp = requests.get(f"{self.GRAPH_URL}/me", params={
            "fields": "id,username,name,account_type",
            "access_token": access_token
        })
        me_resp.raise_for_status()
        me_data = me_resp.json()

        return {
            "access_token": access_token,
            "refresh_token": None,
            "expires_in": expires_in,
            "account_id": me_data.get("id"),
            "account_name": me_data.get("username", me_data.get("name", "Instagram Account")),
            "metadata": {
                "account_type": me_data.get("account_type")
            }
        }

    def validate_token(self, access_token: str) -> bool:
        try:
            resp = requests.get(f"{self.GRAPH_URL}/me", params={"access_token": access_token})
            return resp.status_code == 200
        except Exception:
            return False

    def revoke_token(self, access_token: str) -> bool:
        # Instagram API currently doesn't provide a direct revoke endpoint
        # Users must revoke via their Instagram App settings
        return True

    def publish_post(self, connection, content: str, image_url: str = None) -> dict:
        access_token = connection.get_access_token()
        if not access_token:
            return {"success": False, "error": "No access token available."}
            
        ig_user_id = connection.platform_account_id
        
        try:
            if not image_url:
                return {"success": False, "error": "Instagram requires an image URL to post."}

            # 1. Create Media Container
            container_url = f"{self.GRAPH_URL}/{ig_user_id}/media"
            container_resp = requests.post(container_url, data={
                "image_url": image_url,
                "caption": content,
                "access_token": access_token
            })
            container_resp.raise_for_status()
            creation_id = container_resp.json().get("id")
            
            # 2. Publish Container
            publish_url = f"{self.GRAPH_URL}/{ig_user_id}/media_publish"
            publish_resp = requests.post(publish_url, data={
                "creation_id": creation_id,
                "access_token": access_token
            })
            publish_resp.raise_for_status()
            
            return {
                "success": True,
                "platform_post_id": publish_resp.json().get("id")
            }
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            if e.response is not None:
                error_msg = e.response.text
            return {"success": False, "error": error_msg}
