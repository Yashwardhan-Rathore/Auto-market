from django.db import models
from django.conf import settings

class Task(models.Model):
    """
    Main task entity.
    One task can be assigned to multiple users.
    """

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        URGENT = "URGENT", "Urgent"

    class Status(models.TextChoices):
        ASSIGNED = "ASSIGNED", "Assigned"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        PENDING_APPROVAL = "PENDING_APPROVAL", "Pending Approval"
        APPROVED = "APPROVED", "Approved"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    title = models.CharField(
        max_length=255,
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ASSIGNED,
        db_index=True,
    )

    last_activity_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
        blank=True,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    instructions = models.TextField(
        blank=True,
        null=True,
    )

    # Audience assigned by Admin
    audience = models.ForeignKey(
        "campaigns.Audience",
        on_delete=models.PROTECT,
        related_name="tasks",
        null=False,
        blank=False,
    )

    # Channels assigned by Admin
    channels = models.ManyToManyField(
        "campaigns.Channel",
        related_name="tasks",
        blank=True,
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )

    due_date = models.DateTimeField(
        db_index=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_tasks",
    )

    is_active = models.BooleanField(
        default=True,
    )

    is_deleted = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "tasks"
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["priority"]),
            models.Index(fields=["due_date"]),
            models.Index(fields=["created_by"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title


class TaskAssignment(models.Model):
    """
    Stores individual user progress for a task.
    """

    class Status(models.TextChoices):
        ASSIGNED = "ASSIGNED", "Assigned"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        SUBMITTED = "SUBMITTED", "Submitted"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        OVERDUE = "OVERDUE", "Overdue"

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_assignments"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ASSIGNED,
        db_index=True
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    submitted_at = models.DateTimeField(
        blank=True,
        null=True
    )

    approved_at = models.DateTimeField(
        blank=True,
        null=True
    )

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_task_assignments"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "task_assignments"
        ordering = ["-created_at"]

        unique_together = [
            ("task", "user")
        ]

        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["user"]),
            models.Index(fields=["task"]),
        ]

    def __str__(self):
        return f"{self.task.title} - {self.user.email}"


class TaskComment(models.Model):
    """
    Comments on a task assignment.
    """

    assignment = models.ForeignKey(
        TaskAssignment,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    comment = models.TextField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_comments"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "task_comments"
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.created_by.email}"


class TaskAttachment(models.Model):
    """
    Attachments uploaded for a task assignment.
    """

    assignment = models.ForeignKey(
        TaskAssignment,
        on_delete=models.CASCADE,
        related_name="attachments"
    )

    file = models.FileField(
        upload_to="tasks/"
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_attachments"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "task_attachments"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.file.name
    
