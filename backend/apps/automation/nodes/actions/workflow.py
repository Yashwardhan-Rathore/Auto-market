from apps.automation.models import Automation


class TriggerWorkflowAction:
    def execute(self, execution, node, config):
        from apps.automation.services.dispatcher import dispatch_workflow

        target = Automation.objects.get(
            pk=config["automation_id"],
            owner=execution.automation.owner,
        )
        child_execution = dispatch_workflow(
            target,
            execution.triggered_by,
            context=execution.context,
        )

        return {
            "success": True,
            "execution_id": str(child_execution.id),
        }
