from apps.content_studio.services import ContentStudioService


class GenerateAIContentAction:
    """
    Action node that generates AI content using the content studio.
    """

    def execute(
        self,
        execution,
        node,
        config,
    ):
        prompt = config.get("prompt")
        content_type = config.get("content_type")
        platform = config.get("platform", "NONE")
        
        owner = execution.automation.owner

        generated, version = ContentStudioService.generate_initial_content(
            company=owner.company if hasattr(owner, "company") else None,
            user=owner,
            prompt=prompt,
            content_type=content_type,
            platform=platform
        )

        return {
            "success": True,
            "generated_content_id": str(generated.id),
            "content_version_id": str(version.id),
        }
