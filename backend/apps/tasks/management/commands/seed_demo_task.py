from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import MAUser
from apps.campaigns.models import Audience, Channel
from apps.tasks.models import Task, TaskAssignment


class Command(BaseCommand):
    help = "Create an integrated demo campaign task and assign it to active USER accounts."

    @transaction.atomic
    def handle(self, *args, **options):
        creator_profile = (
            MAUser.objects.select_related("user")
            .filter(role="SUPER_ADMIN", user__is_active=True)
            .first()
            or MAUser.objects.select_related("user")
            .filter(role="ADMIN", user__is_active=True)
            .first()
        )
        if not creator_profile:
            raise CommandError("No active Super Admin or Admin account is available.")

        users = list(
            MAUser.objects.select_related("user")
            .filter(role="USER", user__is_active=True)
        )
        if not users:
            raise CommandError("No active USER account is available for assignment.")

        audience = (
            Audience.objects.filter(is_active=True, name__iexact="All Customers").first()
            or Audience.objects.filter(is_active=True).first()
        )
        if not audience:
            raise CommandError("No active audience is available.")

        channels = list(
            Channel.objects.filter(is_active=True, name__in=["Email", "WhatsApp"])
        )
        if not channels:
            raise CommandError("No Email or WhatsApp channel is available.")

        defaults = {
            "description": "Create and submit a demo customer engagement campaign.",
            "instructions": (
                "Build a campaign template, select an assigned channel, review the "
                "campaign, and submit it to an Admin for approval."
            ),
            "audience": audience,
            "priority": Task.Priority.HIGH,
            "due_date": timezone.now() + timedelta(days=14),
            "created_by": creator_profile.user,
            "status": Task.Status.ASSIGNED,
            "is_active": True,
            "is_deleted": False,
        }
        task = Task.objects.filter(
            title="Demo Customer Engagement Campaign",
            is_deleted=False,
        ).first()
        created = task is None
        if task is None:
            task = Task.objects.create(
                title="Demo Customer Engagement Campaign",
                **defaults,
            )
        else:
            for field, value in defaults.items():
                setattr(task, field, value)
            task.save(update_fields=[*defaults.keys(), "updated_at"])

        task.channels.set(channels)
        assignments = 0
        for profile in users:
            _, assignment_created = TaskAssignment.objects.get_or_create(
                task=task,
                user=profile.user,
                defaults={"status": TaskAssignment.Status.ASSIGNED},
            )
            assignments += int(assignment_created)

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} task #{task.id}; assigned to {len(users)} active users "
                f"({assignments} new assignments)."
            )
        )
