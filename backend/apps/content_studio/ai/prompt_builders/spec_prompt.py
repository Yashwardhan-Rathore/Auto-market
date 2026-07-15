import json
from .base import BasePromptBuilder

class SpecPromptBuilder(BasePromptBuilder):
    """
    Builds the prompt to extract a structured Content Spec (JSON) from raw user input.
    """
    
    def build(self, user_prompt: str) -> str:
        return f"""
You are an expert marketing strategist. Your task is to extract the core content details from the user's input and return them strictly as a JSON object.

USER INPUT:
"{user_prompt}"

INSTRUCTIONS:
1. Extract the primary 'Goal', 'Target Audience', 'Tone', 'Key Message', and any 'Visual Preferences'.
2. If any field is not explicitly mentioned or cannot be inferred, output null for that field.
3. Return ONLY valid JSON. No markdown, no explanations.

EXPECTED JSON SCHEMA:
{{
    "Goal": "string or null",
    "Target Audience": "string or null",
    "Tone": "string or null",
    "Key Message": "string or null",
    "Visual Preferences": "string or null",
    "Additional Requirements": "string or null"
}}
        """.strip()
