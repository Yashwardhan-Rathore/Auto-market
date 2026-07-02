from apps.automation.models import (
    AutomationExecution
)

from apps.automation.tasks import (
    execute_workflow
)


def dispatch_workflow(
    automation,
    user,
):

    execution = (
        AutomationExecution.objects.create(
            automation=automation,
            triggered_by=user,
        )
    )

    execute_workflow.delay(
        str(execution.id)
    )

    return execution