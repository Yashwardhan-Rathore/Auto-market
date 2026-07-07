from celery import shared_task
from django.utils import timezone

from apps.automation.models import (
    AutomationExecution,
)

from apps.automation.services.executor import (
    WorkflowExecutor,
)


@shared_task
def resume_workflows():

    waiting = (
        AutomationExecution
        .objects
        .select_related(
            "current_node",
            "automation",
        )
        .filter(
            status="WAITING",
            resume_at__lte=
                timezone.now(),
        )
    )

    for execution in waiting:

        executor = WorkflowExecutor(
            execution
        )

        next_node = executor.get_next(
            execution.current_node
        )

        if not next_node:
            execution.status = "SUCCESS"
            execution.finished_at = timezone.now()
            execution.save(
                update_fields=[
                    "status",
                    "finished_at",
                ]
            )
            continue

        execution.status = "RUNNING"
        execution.current_node = next_node
        execution.paused_at = None
        execution.resume_at = None
        execution.save(
            update_fields=[
                "status",
                "current_node",
                "paused_at",
                "resume_at",
            ]
        )

        executor = WorkflowExecutor(
            execution,
            start_node=next_node,
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
