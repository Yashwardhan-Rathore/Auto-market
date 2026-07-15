from .base import BasePromptBuilder

class ImagePromptBuilder(BasePromptBuilder):
    """
    Builds an optimized prompt for OpenAI's image generation model (DALL-E).
    """
    
    def build(self, enhanced_prompt: str, brand_identity: dict, platform: str, size: str) -> str:
        return f"""
Generate an optimized image generation prompt for DALL-E based on the following content details.

BRAND IDENTITY:
Tone: {brand_identity.get('tone', 'Not provided')}
Guidelines: {brand_identity.get('guidelines', 'Not provided')}

ENHANCED PROMPT:
{enhanced_prompt}

PLATFORM CONSTRAINTS:
Platform: {platform}
Target Size/Aspect Ratio: {size}

INSTRUCTIONS:
1. Do not generate the image yourself. You are writing the prompt that will be fed to an AI image generator.
2. Focus on clear visual descriptions, lighting, style, and composition.
3. Incorporate the brand identity visually (e.g., color palettes if inferred, professional vs casual photography style).
4. Return ONLY the final image prompt text. Do not wrap in quotes or explain.
        """.strip()
