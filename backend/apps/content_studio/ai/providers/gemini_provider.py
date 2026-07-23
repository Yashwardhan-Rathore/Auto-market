import logging
import base64
import uuid

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
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
            model = getattr(settings, "GEMINI_TEXT_MODEL", None) or model
            # The old convenience alias is not a valid Gemini REST model ID.
            if model == "gemini-flash-latest":
                model = "gemini-3-flash-preview"
            generation_config = {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
            if json_response:
                generation_config["responseMimeType"] = "application/json"

            response = requests.post(
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent",
                headers={
                    "x-goog-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": generation_config,
                },
                timeout=120,
            )
            if response.status_code == 429:
                raise AIRateLimitError("Gemini text generation rate limit exceeded.")
            if response.status_code >= 400:
                try:
                    detail = response.json().get("error", {}).get("message")
                except ValueError:
                    detail = None
                raise AIProviderError(
                    "Gemini text generation failed "
                    f"({response.status_code}): {detail or 'provider error'}"
                )

            candidates = response.json().get("candidates", [])
            parts = (
                candidates[0].get("content", {}).get("parts", [])
                if candidates
                else []
            )
            text = "".join(part.get("text", "") for part in parts).strip()
            if not text:
                raise AIProviderError("Gemini returned no generated text.")
            return text
        except requests.Timeout as exc:
            raise AITimeoutError("Gemini text generation timed out.") from exc
        except requests.RequestException as exc:
            raise AIProviderError("Failed to connect to Gemini text generation.") from exc

    def generate_image(self, prompt, size="1024x1024"):
        """Generate and persist a prompt-based image through Gemini's REST API."""
        if not self.api_key:
            raise AIProviderError("GEMINI_API_KEY is not configured.")

        model = getattr(settings, "GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseModalities": ["IMAGE"],
            },
        }

        try:
            response = requests.post(
                url,
                headers={
                    "x-goog-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=180,
            )
            if response.status_code == 429:
                raise AIRateLimitError("Gemini image generation rate limit exceeded.")
            if response.status_code >= 400:
                error_message = response.json().get("error", {}).get(
                    "message", "Unknown provider error"
                )
                raise AIProviderError(
                    "Gemini image generation failed "
                    f"({response.status_code}): {error_message}"
                )

            candidates = response.json().get("candidates", [])
            parts = (
                candidates[0].get("content", {}).get("parts", [])
                if candidates
                else []
            )
            for part in parts:
                inline_data = part.get("inlineData") or part.get("inline_data")
                if not inline_data or not inline_data.get("data"):
                    continue

                mime_type = inline_data.get("mimeType") or inline_data.get(
                    "mime_type", "image/png"
                )
                extension = "jpg" if "jpeg" in mime_type else "png"
                image_bytes = base64.b64decode(inline_data["data"])
                saved_path = default_storage.save(
                    f"generated_images/{uuid.uuid4()}.{extension}",
                    ContentFile(image_bytes),
                )
                return default_storage.url(saved_path)

            raise AIProviderError("Gemini returned no generated image.")
        except requests.Timeout as exc:
            raise AITimeoutError("Gemini image generation timed out.") from exc
        except requests.RequestException as exc:
            raise AIProviderError("Failed to connect to Gemini image generation.") from exc
