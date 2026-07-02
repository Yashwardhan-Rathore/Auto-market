from celery import shared_task

from apps.automation.models import (
    AutomationExecution
)

from apps.automation.services.executor import (
    WorkflowExecutor
)


@shared_task(
    bind=True,
    max_retries=3
)
def execute_workflow(
    self,
    execution_id
):

    execution = (
        AutomationExecution
        .objects
        .get(
            pk=execution_id
        )
    )

    execution.status = "RUNNING"
    execution.save()

    try:

        executor = WorkflowExecutor(
            execution
        )

        executor.run()

        execution.status = "SUCCESS"

        execution.save()

        return True

    except Exception as e:

        execution.status = "FAILED"

        execution.error_message = str(e)

        execution.save()

        raise self.retry(
            exc=e,
            countdown=30
        )