from .base import BasePromptBuilder

class QuestionPromptBuilder(BasePromptBuilder):
    """
    Builds the prompt to generate dynamic questions based on missing information in the Content Spec.
    """
    
    def build(self, content_spec: dict, brand_identity: dict) -> str:
        return f"""
You are an expert creative director. We are planning a marketing content, and we need more information from the client to generate high-quality content.

BRAND IDENTITY:
Tone: {brand_identity.get('tone', 'Not provided')}
Target Audience: {brand_identity.get('target_audience', 'Not provided')}

CURRENT content SPEC:
{content_spec}

INSTRUCTIONS:
1. Identify what critical information is missing from the content SPEC that would improve the final content.
2. Generate 2 to 3 highly relevant questions to ask the client.
3. Return the output STRICTLY as a JSON object.

EXPECTED JSON SCHEMA:
{{
    "questions": [
        {{
            "question_text": "string",
            "type": "single_select | multi_select | text",
            "options": ["string", "string"]
        }}
    ]
}}
        """.strip()
