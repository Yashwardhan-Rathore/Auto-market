from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User

from .models import (
    Task,
    TaskAssignment,
)


@transaction.atomic
def create_task(
    *,
    title,
    description,
<<<<<<< HEAD
=======
    instructions,
    audience,
    channels,
>>>>>>> feature/dashboard
    priority,
    due_date,
    created_by,
    users,
):
    """
    Create task and assign users.
    """

<<<<<<< HEAD
    task = Task.objects.create(
        title=title,
        description=description,
=======
    # Create task
    task = Task.objects.create(
        title=title,
        description=description,
        instructions=instructions,
        audience=audience,
>>>>>>> feature/dashboard
        priority=priority,
        due_date=due_date,
        created_by=created_by,
    )

<<<<<<< HEAD
    assignments = []

    for user_id in users:

        user = User.objects.get(id=user_id)

        assignments.append(
=======
    # Assign allowed channels
    task.channels.set(channels)

    # Fetch all users in one query
    user_objects = User.objects.filter(
        id__in=users,
    )

    # Create assignments
    TaskAssignment.objects.bulk_create(
        [
>>>>>>> feature/dashboard
            TaskAssignment(
                task=task,
                user=user,
            )
<<<<<<< HEAD
        )

    TaskAssignment.objects.bulk_create(
        assignments
=======
            for user in user_objects
        ]
>>>>>>> feature/dashboard
    )

    return task


def get_user_tasks(user):
    """
    Return tasks assigned to current user.
    """

    return (
        TaskAssignment.objects
        .filter(user=user)
        .select_related(
            "task",
            "approved_by",
        )
        .prefetch_related(
            "comments",
            "attachments",
        )
        .order_by("-created_at")
    )


def get_admin_tasks(admin):
    """
    Return tasks created by admin.
    """

    return (
        Task.objects
        .filter(created_by=admin)
        .prefetch_related(
            "assignments",
            "assignments__user",
        )
        .order_by("-created_at")
    )


def start_task(
    assignment,
):
    """
    ASSIGNED -> IN_PROGRESS
    """

    assignment.status = (
        TaskAssignment.Status.IN_PROGRESS
    )

    assignment.save()

    return assignment


def submit_task(
    assignment,
    remarks=None,
):
    """
    IN_PROGRESS -> SUBMITTED
    """

    assignment.status = (
        TaskAssignment.Status.SUBMITTED
    )

    assignment.remarks = remarks

    assignment.submitted_at = (
        timezone.now()
    )

    assignment.save()

    return assignment

def approve_task(
    assignment,
    approved_by,
    remarks=None,
):
    """
    SUBMITTED -> APPROVED
    """

    assignment.status = (
        TaskAssignment.Status.APPROVED
    )

    assignment.approved_by = approved_by

    assignment.approved_at = (
        timezone.now()
    )

    assignment.remarks = remarks

    assignment.save()

    return assignment


def reject_task(
    assignment,
    approved_by,
    remarks=None,
):
    """
    SUBMITTED -> REJECTED
    """

    assignment.status = (
        TaskAssignment.Status.REJECTED
    )

    assignment.approved_by = approved_by

    assignment.approved_at = (
        timezone.now()
    )

    assignment.remarks = remarks

    assignment.save()

    return assignment

def get_task_summary(user):

    qs = TaskAssignment.objects.filter(
        user=user
    )

    return {
        "assigned":
            qs.filter(
                status="ASSIGNED"
            ).count(),

        "in_progress":
            qs.filter(
                status="IN_PROGRESS"
            ).count(),

        "submitted":
            qs.filter(
                status="SUBMITTED"
            ).count(),

        "approved":
            qs.filter(
                status="APPROVED"
            ).count(),

        "rejected":
            qs.filter(
                status="REJECTED"
            ).count(),

        "overdue":
            qs.filter(
                status="OVERDUE"
            ).count(),
    }

