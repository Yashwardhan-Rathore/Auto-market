import os
import requests
from typing import Dict, Any
from .base import BaseSocialProvider

class LinkedInProvider(BaseSocialProvider):
    """Implements LinkedIn OAuth 2.0 (v2 API)."""
    
    AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"
    ACCESS_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
    ME_URL = "https://api.linkedin.com/v2/userinfo"

    def __init__(self):
        self.client_id = os.environ.get("LINKEDIN_CLIENT_ID", "")
        self.client_secret = os.environ.get("LINKEDIN_CLIENT_SECRET", "")

    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        scopes = "openid profile email w_member_social"
        return f"{self.AUTHORIZE_URL}?response_type=code&client_id={self.client_id}&redirect_uri={redirect_uri}&state={state}&scope={scopes}"

    def exchange_code(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        response = requests.post(self.ACCESS_TOKEN_URL, data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        })
        response.raise_for_status()
        data = response.json()
        
        access_token = data.get("access_token")
        
        # Fetch user profile
        headers = {"Authorization": f"Bearer {access_token}"}
        me_resp = requests.get(self.ME_URL, headers=headers)
        me_resp.raise_for_status()
        me_data = me_resp.json()
        
        return {
            "access_token": access_token,
            "refresh_token": data.get("refresh_token"),
            "expires_in": data.get("expires_in"),
            "account_id": me_data.get("sub"),
            "account_name": me_data.get("name"),
            "metadata": {
                "picture": me_data.get("picture")
            }
        }

    def validate_token(self, access_token: str) -> bool:
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            resp = requests.get(self.ME_URL, headers=headers)
            return resp.status_code == 200
        except Exception:
            return False

    def revoke_token(self, access_token: str) -> bool:
        # LinkedIn does not have a standard token revocation endpoint
        # The user must revoke from their LinkedIn settings
        return True

    def publish_post(self, connection, content: str, image_url: str = None) -> dict:
        """Publishes to LinkedIn via UGC Post API."""
        access_token = connection.get_access_token()
        if not access_token:
            return {"success": False, "error": "No access token available."}
            
        # account_id is the URN (e.g., 'urn:li:person:12345')
        # Sometimes connection.platform_account_id is just the raw ID, we need to prefix it
        author = connection.platform_account_id
        if not author.startswith("urn:li:"):
            author = f"urn:li:person:{author}"
            
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }
        
        post_url = "https://api.linkedin.com/v2/ugcPosts"
        
        payload = {
            "author": author,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        if image_url:
            # Note: A real implementation for LinkedIn image posts usually requires a 3-step 
            # upload process (registerUpload, upload image binary, post). 
            # Here, we will pass the image URL as a standard share article/image to keep it simple,
            # or rely on OpenGraph scraping if it's an ARTICLE category.
            # We'll use the ARTICLE approach which accepts external URLs.
            payload["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "ARTICLE"
            payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
                {
                    "status": "READY",
                    "originalUrl": image_url
                }
            ]
            
        try:
            resp = requests.post(post_url, headers=headers, json=payload)
            resp.raise_for_status()
            
            return {
                "success": True,
                "platform_post_id": resp.json().get("id")
            }
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            if e.response is not None:
                error_msg = e.response.text
            return {"success": False, "error": error_msg}
