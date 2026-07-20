import logging
from apps.content_studio.ai.providers.gemini_provider import GeminiProvider

logger = logging.getLogger(__name__)

class GeminiService:
    @staticmethod
    def generate_content(prompt, content_type="email"):
        """
        Calls Gemini to generate content, enforcing marketing constraints.
        """
        logger.info(f"Generating {content_type} with prompt: {prompt}")
        
        # Enforce constraints: append context to the prompt
        system_prompt = f"You are a professional marketing assistant. Only generate marketing-related content. Task: generate {content_type}.\n\n"
        full_prompt = system_prompt + prompt
        
        provider = GeminiProvider()
        return provider.generate_text(full_prompt)
