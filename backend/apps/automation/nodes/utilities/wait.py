from datetime import timedelta
from django.utils import timezone


class WaitNode:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        hours = config.get(
            "hours",
            1,
        )

        execution.status = "WAITING"

        execution.finished_at = (
            timezone.now()
            + timedelta(hours=hours)
        )

        execution.save()

        return {
            "success": True,
            "message": (
                f"Waiting "
                f"{hours} hours"
            ),
        }