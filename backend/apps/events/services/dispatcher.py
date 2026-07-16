from apps.automation.models import Automation
from apps.automation.services.dispatcher import dispatch_workflow


def dispatch_website_event(event):
    automations = (
        Automation.objects.filter(
            status=Automation.Status.PUBLISHED,
            is_active=True,
            nodes__node_type="TRIGGER",
            nodes__action_name=event.event_name,
        )
        .distinct()
    )

    context = {
        "event": {
            "id": str(event.id),
            "name": event.event_name,
            "user": event.user_identifier,
            "session_id": event.session_id,
            "url": event.url,
            "metadata": event.metadata,
            "created_at": event.created_at.isoformat(),
        }
    }

    return [
        dispatch_workflow(
            automation,
            None,
            context=context,
        )
        for automation in automations
    ]

