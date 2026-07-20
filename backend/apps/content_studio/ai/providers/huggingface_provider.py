import logging
import base64
import requests
from django.conf import settings
from ..exceptions import AITimeoutError, AIRateLimitError, AIProviderError

logger = logging.getLogger(__name__)

class HuggingFaceProvider:
    """
    Provider wrapper for Hugging Face Inference API.
    Handles formatting of calls, structured responses, and exception translation.
    """
    
    def __init__(self):
        self.api_key = getattr(settings, "HF_TOKEN", None)
        self.model = getattr(settings, "HF_IMAGE_MODEL", "stabilityai/stable-diffusion-xl-base-1.0")
        self.api_url = f"https://router.huggingface.co/hf-inference/models/{self.model}"
        
        if not self.api_key:
            logger.warning("HF_TOKEN not set. Hugging Face API calls will fail.")

    def generate_image(self, prompt, size="1024x1024"):
        """
        Calls the Hugging Face API to generate an image.
        Returns a base64 encoded data URL of the generated image.
        """
        if not self.api_key:
            raise AIProviderError("Hugging Face API token (HF_TOKEN) is not configured.")

        try:
            from huggingface_hub import InferenceClient
            
            client = InferenceClient(
                provider="auto",
                api_key=self.api_key
            )
            
            # This returns a PIL Image
            image = client.text_to_image(
                prompt=prompt,
                model=self.model
            )
            
            # Convert PIL Image to bytes
            import io
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG')
            image_bytes = img_byte_arr.getvalue()
            
            # Save it locally
            import uuid
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            
            filename = f"generated_images/{uuid.uuid4()}.jpg"
            saved_path = default_storage.save(filename, ContentFile(image_bytes))
            file_url = default_storage.url(saved_path)
            
            return file_url

        except Exception as e:
            raise AIProviderError(f"Hugging Face error: {str(e)}") from e
