import re


class TemplateRenderer:
    """
    Renders template placeholders using customer data.

    Example:
        Template:
            Hello {{name}}

        Context:
            {"name": "Carlos"}

        Output:
            Hello Carlos
    """

    PLACEHOLDER_PATTERN = re.compile(
        r"\{\{\s*(.*?)\s*\}\}"
    )

    @classmethod
    def render(
        cls,
        template: str,
        context: dict,
    ) -> str:
        """
        Replace {{field}} placeholders with values
        from the supplied context.
        """

        if not template:
            return ""

        if context is None:
            context = {}

        def replace(match):

            field = match.group(1)

            value = context.get(field)

            if value is None:
                return ""

            return str(value)

        return cls.PLACEHOLDER_PATTERN.sub(
            replace,
            template,
        )