import logging
from django.conf import settings
from ..exceptions import AITimeoutError, AIRateLimitError, AIProviderError

logger = logging.getLogger(__name__)

try:
    import openai
    from openai import OpenAIError, RateLimitError, APITimeoutError, APIConnectionError
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

class OpenAIProvider:
    """
    Provider wrapper for OpenAI SDK.
    Handles formatting of calls, structured responses, and exception translation.
    """
    
    def __init__(self):
        self.api_key = getattr(settings, "OPENAI_API_KEY", None)
        self.use_mock = not HAS_OPENAI or not self.api_key
        if not self.use_mock:
            self.client = openai.OpenAI(api_key=self.api_key)
        else:
            logger.warning("OpenAI SDK not available or API_KEY not set. Using mock responses.")

    def generate_text(self, prompt, model="gpt-4", max_tokens=1000, temperature=0.7, json_response=False):
        if self.use_mock:
            return self._mock_generate_text(prompt, json_response)
            
        try:
            kwargs = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            if json_response:
                kwargs["response_format"] = {"type": "json_object"}
                
            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
            
        except RateLimitError as e:
            raise AIRateLimitError("OpenAI rate limit exceeded.") from e
        except APITimeoutError as e:
            raise AITimeoutError("OpenAI request timed out.") from e
        except APIConnectionError as e:
            raise AIProviderError("Failed to connect to OpenAI.") from e
        except OpenAIError as e:
            raise AIProviderError(f"OpenAI error: {str(e)}") from e
        except Exception as e:
            raise AIProviderError(f"Unexpected error calling OpenAI: {str(e)}") from e

    def generate_image(self, prompt, size="1024x1024"):
        if self.use_mock:
            return self._mock_generate_image(prompt)
            
        try:
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                n=1,
                size=size
            )
            return response.data[0].url
            
        except RateLimitError as e:
            raise AIRateLimitError("OpenAI rate limit exceeded.") from e
        except APITimeoutError as e:
            raise AITimeoutError("OpenAI request timed out.") from e
        except APIConnectionError as e:
            raise AIProviderError("Failed to connect to OpenAI.") from e
        except OpenAIError as e:
            raise AIProviderError(f"OpenAI error: {str(e)}") from e
        except Exception as e:
            raise AIProviderError(f"Unexpected error calling OpenAI: {str(e)}") from e

    def _mock_generate_text(self, prompt, json_response):
        if json_response:
            return '{"status": "success", "data": "Mock JSON response extracted from spec."}'
        return f"[MOCK AI RESPONSE] Generated based on prompt: {prompt[:50]}..."

    def _mock_generate_image(self, prompt):
        return "https://fake-s3-bucket.s3.amazonaws.com/mock-ai-image.jpg"
