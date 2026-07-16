import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    @staticmethod
    def generate_content(prompt, content_type="email"):
        """
        Calls OpenAI to generate content, enforcing marketing constraints.
        Placeholder implementation.
        """
        logger.info(f"Generating {content_type} with prompt: {prompt}")
        
        # Enforce constraints: append context to the prompt
        system_prompt = "You are a professional marketing assistant. Only generate marketing-related content."
        
        # Fake response for now
        return f"[AI GENERATED {content_type.upper()}] based on: {prompt}"

    @staticmethod
    def generate_image(prompt):
        """
        Calls OpenAI to generate an image.
        Placeholder implementation.
        """
        logger.info(f"Generating image with prompt: {prompt}")
        
        return "https://fake-s3-bucket.s3.amazonaws.com/ai-image.jpg"
