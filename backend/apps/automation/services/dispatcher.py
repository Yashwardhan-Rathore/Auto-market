from apps.automation.models import (
    AutomationExecution
)

from apps.automation.tasks import (
    execute_workflow
)


def dispatch_workflow(
    automation,
    user,
    context=None,
):

    execution = (
        AutomationExecution.objects.create(
            automation=automation,
            triggered_by=user,
            context=context or {},
        )
    )

    execute_workflow.delay(
        str(execution.id)
    )

    return execution
