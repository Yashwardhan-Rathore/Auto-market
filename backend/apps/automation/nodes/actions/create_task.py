from django.utils import timezone

from apps.tasks.models import Task


class CreateTaskAction:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        task = Task.objects.create(
            title=config.get(
                "title"
            ),

            description=config.get(
                "description",
                ""
            ),

            priority=config.get(
                "priority",
                "MEDIUM"
            ),

            due_date=timezone.now(),

            created_by=execution.triggered_by,
        )

        return {
            "success": True,
            "message": f"Task created: {task.id}",
            "task": task,
        }