from .base import BasePromptBuilder

class EnhancerPromptBuilder(BasePromptBuilder):
    """
    Builds the final enhanced prompt based on Content Spec and User Answers.
    """
    
    def build(self, content_spec: dict, user_answers: dict) -> str:
        return f"""
You are a senior copywriter. We have a draft specification and user answers to follow-up questions.
Your goal is to merge these into a final, highly concise ENHANCED PROMPT formatted strictly as Key = Value pairs.

CURRENT content SPEC:
{content_spec}

USER ANSWERS TO QUESTIONS:
{user_answers}

INSTRUCTIONS:
1. Merge the data logically.
2. Format the output as concise Key = Value pairs, one per line.
3. Remove any missing or null fields.
4. Do NOT output any conversational text or markdown formatting outside of the Key = Value pairs.

EXAMPLE OUTPUT:
Audience = Young Professionals
Tone = Friendly
Goal = Brand Awareness
CTA = Visit Website
Visual Style = Modern
        """.strip()
