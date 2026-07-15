from .base import BasePromptBuilder

class CaptionPromptBuilder(BasePromptBuilder):
    """
    Builds an optimized prompt for generating a social media caption tailored to a specific platform.
    """
    
    def build(self, enhanced_prompt: str, platform: str, brand_identity: dict) -> str:
        platform_rules = self._get_platform_rules(platform)
        
        return f"""
You are an elite social media manager. Write a caption for {platform} based on the content details below.

BRAND IDENTITY:
Tone: {brand_identity.get('tone', 'Not provided')}
Guidelines: {brand_identity.get('guidelines', 'Not provided')}

ENHANCED PROMPT:
{enhanced_prompt}

PLATFORM RULES FOR {platform}:
{platform_rules}

INSTRUCTIONS:
1. Write the caption text only.
2. Do not include image descriptions.
3. Ensure it perfectly matches the platform's standard formatting and length expectations.
        """.strip()

    def _get_platform_rules(self, platform: str) -> str:
        platform = platform.upper()
        if platform == "INSTAGRAM":
            return "Keep it visually descriptive and engaging. Use line breaks. End with 5-10 relevant hashtags."
        elif platform == "LINKEDIN":
            return "Professional, insightful, and value-driven. Use 3-5 hashtags. Encourage professional discussion."
        elif platform == "X":
            return "Extremely concise. Must fit within 280 characters. Use 1-2 impactful hashtags."
        elif platform == "FACEBOOK":
            return "Conversational and community-focused. Encourage comments and sharing. Use 1-3 hashtags."
        return "Write a standard, engaging social media post."
