from apps.automation.models import Automation
from apps.automation.services.dispatcher import dispatch_workflow


def matching_webhook_automations(secret):
    return (
        Automation.objects.filter(
            status=Automation.Status.PUBLISHED,
            is_active=True,
            nodes__node_type="TRIGGER",
            nodes__action_name="WEBHOOK_RECEIVED",
            nodes__business_config__secret=secret,
        )
        .distinct()
    )


def dispatch_webhook_event(event):
    executions = []
    context = {
        "webhook": {
            "id": str(event.id),
            "secret": event.secret,
            "payload": event.payload,
            "headers": event.headers,
            "created_at": event.created_at.isoformat(),
        }
    }

    for automation in matching_webhook_automations(event.secret):
        executions.append(
            dispatch_workflow(
                automation,
                None,
                context=context,
            )
        )

    event.processed = True
    event.save(
        update_fields=[
            "processed",
        ]
    )

    return executions

