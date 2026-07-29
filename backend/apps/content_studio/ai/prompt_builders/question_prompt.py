from .base import BasePromptBuilder

class QuestionPromptBuilder(BasePromptBuilder):
    """
    Builds the prompt to generate dynamic questions based on missing information in the Content Spec.
    """
    
    def build(self, content_spec: dict, brand_identity: dict) -> str:
        return f"""
You are an expert creative director. We are planning a marketing content, and we need more information from the client to generate high-quality content.

BRAND IDENTITY:
- Brand Description: {brand_identity.get('brand_description', 'Not provided')}
- Target Audience: {brand_identity.get('target_audience', 'Not provided')}
- Brand Tone: {brand_identity.get('tone', 'Not provided')}
- Content Pillars/Topics: {brand_identity.get('content_pillars', 'Not provided')}
- Unique Value / Differentiator: {brand_identity.get('unique_value', 'Not provided')}
- Content Guidelines (Do's & Don'ts): {brand_identity.get('guidelines', 'Not provided')}
- Desired Call to Action: {brand_identity.get('call_to_action', 'Not provided')}

CURRENT CONTENT SPEC:
{content_spec}

INSTRUCTIONS:
1. Identify what critical information is missing from the content SPEC that would improve the final content.
2. Use the brand identity above to avoid asking questions already answered by it.
3. Generate up to 10 highly relevant multiple-choice questions (MCQs) to ask the client.
4. Return the output STRICTLY as a JSON object.

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
