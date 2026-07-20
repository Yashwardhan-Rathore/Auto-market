from django.db.models import Avg, DurationField, ExpressionWrapper, F, Q

from apps.automation.models import AutomationExecution
from apps.communications.models import CommunicationEvent
from apps.accounts.models import MAUser


def visible_events(user):
    role = MAUser.objects.filter(user=user).values_list("role", flat=True).first()
    events = CommunicationEvent.objects.all()
    if user.is_superuser or role == "SUPER_ADMIN":
        return events
    if role == "ADMIN" and user.department_id:
        return events.filter(
            Q(campaign__created_by__department_id=user.department_id)
            | Q(execution__automation__owner__department_id=user.department_id)
        ).distinct()
    return events.filter(
        Q(campaign__created_by=user)
        | Q(execution__automation__owner=user)
    ).distinct()


def visible_executions(user):
    role = MAUser.objects.filter(user=user).values_list("role", flat=True).first()
    executions = AutomationExecution.objects.all()
    if user.is_superuser or role == "SUPER_ADMIN":
        return executions
    if role == "ADMIN" and user.department_id:
        return executions.filter(automation__owner__department_id=user.department_id)
    return executions.filter(automation__owner=user)


def rate(numerator, denominator):
    if denominator == 0:
        return 0

    return round((numerator / denominator) * 100, 2)


def communication_metrics(user):
    events = visible_events(user)

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


def workflow_metrics(user):
    executions = visible_executions(user)
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


def all_metrics(user):
    data = communication_metrics(user)
    data["workflow"] = workflow_metrics(user)
    return data

