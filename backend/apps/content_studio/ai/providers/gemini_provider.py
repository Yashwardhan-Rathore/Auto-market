import logging
from django.conf import settings
from ..exceptions import AITimeoutError, AIRateLimitError, AIProviderError

logger = logging.getLogger(__name__)

class GeminiProvider:
    """
    Provider wrapper for Google Gemini SDK.
    Handles formatting of calls, structured responses, and exception translation.
    """
    
    def __init__(self):
        self.api_key = getattr(settings, "GEMINI_API_KEY", None)
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set. Gemini API calls will fail.")

    def generate_text(self, prompt, model="gemini-flash-latest", max_tokens=1000, temperature=0.7, json_response=False):
        """
        Calls the Gemini API to generate text.
        """
        if not self.api_key:
            raise AIProviderError("Gemini API token (GEMINI_API_KEY) is not configured.")

        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=self.api_key)
            
            config_kwargs = {
                "temperature": temperature
            }
            
            if json_response:
                config_kwargs["response_mime_type"] = "application/json"
                
            config = types.GenerateContentConfig(**config_kwargs)
            
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config
            )
            
            return response.text
            
        except Exception as e:
            # We catch Exception broadly as google-genai might raise various errors (e.g. google.genai.errors.APIError)
            error_str = str(e).lower()
            if "quota" in error_str or "rate limit" in error_str or "429" in error_str:
                raise AIRateLimitError(f"Gemini rate limit exceeded: {str(e)}") from e
            if "timeout" in error_str:
                raise AITimeoutError(f"Gemini request timed out: {str(e)}") from e
                
            raise AIProviderError(f"Gemini error: {str(e)}") from e
