from django.db.models import Avg, DurationField, ExpressionWrapper, F, Q

from apps.automation.models import AutomationExecution
from apps.communications.models import CommunicationEvent
from apps.common.utils import filter_by_tenant


def rate(numerator, denominator):
    if denominator == 0:
        return 0

    return round((numerator / denominator) * 100, 2)


def communication_metrics(organization):
    events = filter_by_tenant(
        CommunicationEvent.objects.all(), organization, "organization"
    )

    email_sent = events.filter(
        channel="EMAIL",
        event_name="EMAIL_SENT",
    ).count()
    sms_sent = events.filter(
        channel="SMS",
        event_name="SMS_SENT",
    ).count()
    whatsapp_sent = events.filter(
        channel="WHATSAPP",
        event_name="WHATSAPP_SENT",
    ).count()

    return {
        "email": {
            "sent": email_sent,
            "open_rate": rate(
                events.filter(event_name="EMAIL_OPENED").count(),
                email_sent,
            ),
            "click_rate": rate(
                events.filter(event_name="EMAIL_CLICKED").count(),
                email_sent,
            ),
            "bounce_rate": rate(
                events.filter(event_name="EMAIL_BOUNCED").count(),
                email_sent,
            ),
            "unsubscribe_rate": rate(
                events.filter(event_name="EMAIL_UNSUBSCRIBED").count(),
                email_sent,
            ),
        },
        "sms": {
            "sent": sms_sent,
            "delivery_rate": rate(
                events.filter(event_name="SMS_DELIVERED").count(),
                sms_sent,
            ),
        },
        "whatsapp": {
            "sent": whatsapp_sent,
            "read_rate": rate(
                events.filter(event_name="WHATSAPP_READ").count(),
                whatsapp_sent,
            ),
            "reply_rate": rate(
                events.filter(event_name="WHATSAPP_REPLIED").count(),
                whatsapp_sent,
            ),
        },
    }


def workflow_metrics(organization):
    executions = filter_by_tenant(
        AutomationExecution.objects.all(), organization, "automation__owner"
    )
    total = executions.count()
    success = executions.filter(
        status=AutomationExecution.Status.SUCCESS
    ).count()
    failed = executions.filter(
        status=AutomationExecution.Status.FAILED
    ).count()
    duration = ExpressionWrapper(
        F("finished_at") - F("started_at"),
        output_field=DurationField(),
    )
    average = (
        executions.filter(
            finished_at__isnull=False
        )
        .annotate(duration=duration)
        .aggregate(value=Avg("duration"))
        .get("value")
    )

    return {
        "execution_count": total,
        "success_rate": rate(success, total),
        "failure_rate": rate(failed, total),
        "average_duration": (
            average.total_seconds()
            if average
            else 0
        ),
    }


def all_metrics(organization):
    data = communication_metrics(organization)
    data["workflow"] = workflow_metrics(organization)
    return data

