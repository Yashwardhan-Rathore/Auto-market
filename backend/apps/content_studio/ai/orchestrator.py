import json
import logging
from .providers.openai_provider import OpenAIProvider
from .prompt_builders import (
    SpecPromptBuilder,
    QuestionPromptBuilder,
    EnhancerPromptBuilder,
    ImagePromptBuilder,
    CaptionPromptBuilder
)
from .exceptions import AIProviderError

logger = logging.getLogger(__name__)

class AIOrchestrator:
    """
    Coordinates the AI workflow by selecting prompt builders and calling the provider.
    Business logic and side-effects (billing, versioning) are handled by AILifecycleService, not here.
    """
    
    def __init__(self):
        # In the future, provider selection could be dynamic based on user preference or availability.
        self.provider = OpenAIProvider()

    def extract_content_spec(self, user_prompt: str) -> dict:
        """
        Extracts a structured content spec (JSON) from raw input.
        """
        builder = SpecPromptBuilder()
        prompt = builder.build(user_prompt)
        
        raw_response = self.provider.generate_text(prompt, model="gpt-4", json_response=True)
        try:
            return json.loads(raw_response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse spec JSON: {raw_response}")
            raise AIProviderError("AI returned invalid JSON for the Content Spec.") from e

    def generate_questions(self, content_spec: dict, brand_identity: dict) -> list:
        """
        Generates dynamic follow-up questions based on the content spec.
        """
        builder = QuestionPromptBuilder()
        prompt = builder.build(content_spec, brand_identity)
        
        raw_response = self.provider.generate_text(prompt, model="gpt-4", json_response=True)
        try:
            return json.loads(raw_response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse questions JSON: {raw_response}")
            raise AIProviderError("AI returned invalid JSON for questions.") from e

    def enhance_prompt(self, content_spec: dict, user_answers: dict) -> str:
        """
        Merges spec and user answers into a final enhanced prompt.
        """
        builder = EnhancerPromptBuilder()
        prompt = builder.build(content_spec, user_answers)
        
        # This is a text-based generation, not strictly JSON
        return self.provider.generate_text(prompt, model="gpt-4")

    def build_and_generate_image(self, enhanced_prompt: str, brand_identity: dict, platform: str, size: str) -> str:
        """
        Builds the image prompt and calls the image generation model.
        Returns the image URL.
        """
        builder = ImagePromptBuilder()
        image_prompt = builder.build(enhanced_prompt, brand_identity, platform, size)
        
        logger.info(f"Generated optimized image prompt: {image_prompt}")
        
        return self.provider.generate_image(image_prompt, size=size)

    def build_and_generate_caption(self, enhanced_prompt: str, platform: str, brand_identity: dict) -> str:
        """
        Builds the platform-specific caption prompt and calls the text generation model.
        """
        builder = CaptionPromptBuilder()
        caption_prompt = builder.build(enhanced_prompt, platform, brand_identity)
        
        return self.provider.generate_text(caption_prompt, model="gpt-4", max_tokens=500)
