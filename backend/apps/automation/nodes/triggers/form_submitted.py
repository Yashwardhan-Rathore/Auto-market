from apps.forms.models import (
    FormSubmission
)


class FormSubmittedTrigger:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        form_id = config.get(
            "form_id"
        )

        submission = (
            FormSubmission.objects
            .filter(
                form_id=form_id
            )
            .order_by("-submitted_at")
            .first()
        )

        return {
            "success": True,
            "submission": submission,
        }