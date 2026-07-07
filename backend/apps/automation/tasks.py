from celery import shared_task
from django.utils import timezone

from apps.automation.models import (
    AutomationExecution
)

from apps.automation.services.executor import (
    WorkflowExecutor
)

from apps.automation.services.retry import (
    mark_retry_or_failed,
)

from apps.automation.tasks_resume import resume_workflows  # noqa: F401


@shared_task(
    bind=True,
    max_retries=None
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
    execution.retry_after = None
    execution.save(
        update_fields=[
            "status",
            "retry_after",
        ]
    )

    try:

        executor = WorkflowExecutor(
            execution
        )

        completed = executor.run()

        if completed:

            execution.status = "SUCCESS"
            execution.finished_at = timezone.now()
            execution.save(
                update_fields=[
                    "status",
                    "finished_at",
                ]
            )

        return completed

    except Exception as e:

        delay = mark_retry_or_failed(
            execution,
            e,
        )

        if delay is None:
            return False

        raise self.retry(
            exc=e,
            countdown=delay
        )
