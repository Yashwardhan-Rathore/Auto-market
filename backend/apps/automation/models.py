import uuid

from django.conf import settings
from django.db import models


# ============================================================
# AUTOMATION
# ============================================================

class Automation(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        VALIDATED = "VALIDATED", "Validated"
        PUBLISHED = "PUBLISHED", "Published"
        PAUSED = "PAUSED", "Paused"
        ARCHIVED = "ARCHIVED", "Archived"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    name = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_automations"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )

    is_active = models.BooleanField(
        default=True
    )

    is_template = models.BooleanField(
        default=False
    )

    is_public = models.BooleanField(
        default=False
    )

    version = models.PositiveIntegerField(
        default=1
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "automation"

        ordering = [
            "-created_at"
        ]

        indexes = [
            models.Index(fields=["owner"]),
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.name


# ============================================================
# AUTOMATION MEMBERS
# ============================================================

class AutomationMember(models.Model):

    class Permission(models.TextChoices):
        VIEW = "VIEW", "View"
        EDIT = "EDIT", "Edit"
        EXECUTE = "EXECUTE", "Execute"
        ADMIN = "ADMIN", "Admin"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name="members"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="automation_memberships"
    )

    permission = models.CharField(
        max_length=20,
        choices=Permission.choices
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="shared_automations"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "automation_member"

        unique_together = [
            ("automation", "user")
        ]

        indexes = [
            models.Index(fields=["automation"]),
            models.Index(fields=["user"]),
            models.Index(fields=["permission"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.permission}"


# ============================================================
# AUTOMATION NODES
# ============================================================

class AutomationNode(models.Model):

    class NodeType(models.TextChoices):
        TRIGGER = "TRIGGER", "Trigger"
        CONDITION = "CONDITION", "Condition"
        ACTION = "ACTION", "Action"
        UTILITY = "UTILITY", "Utility"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name="nodes"
    )

    node_type = models.CharField(
        max_length=30,
        choices=NodeType.choices,
        db_index=True
    )

    action_name = models.CharField(
        max_length=100,
        db_index=True
    )

    label = models.CharField(
        max_length=255
    )

    business_config = models.JSONField(
        default=dict,
        blank=True
    )

    ui_config = models.JSONField(
        default=dict,
        blank=True
    )

    execution_order = models.IntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "automation_node"

        indexes = [
            models.Index(fields=["automation"]),
            models.Index(fields=["node_type"]),
            models.Index(fields=["action_name"]),
        ]

    def __str__(self):
        return self.label


# ============================================================
# AUTOMATION EDGES
# ============================================================

class AutomationEdge(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name="edges"
    )

    source_node = models.ForeignKey(
        AutomationNode,
        on_delete=models.CASCADE,
        related_name="outgoing_edges"
    )

    target_node = models.ForeignKey(
        AutomationNode,
        on_delete=models.CASCADE,
        related_name="incoming_edges"
    )

    edge_type = models.CharField(
        max_length=50,
        default="DEFAULT"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "automation_edge"

        indexes = [
            models.Index(fields=["automation"]),
            models.Index(fields=["source_node"]),
            models.Index(fields=["target_node"]),
        ]

    def __str__(self):
        return f"{self.source_node} -> {self.target_node}"


# ============================================================
# AUTOMATION EXECUTION
# ============================================================

class AutomationExecution(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RUNNING = "RUNNING", "Running"
        WAITING = "WAITING", "Waiting"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name="executions"
    )

    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    current_node = models.ForeignKey(
        AutomationNode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )

    retry_count = models.PositiveIntegerField(
        default=0
    )

    error_message = models.TextField(
        blank=True
    )

    started_at = models.DateTimeField(
        auto_now_add=True
    )

    finished_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = "automation_execution"

        indexes = [
            models.Index(fields=["automation"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.automation.name} - {self.status}"


# ============================================================
# AUTOMATION EXECUTION LOGS
# ============================================================

class AutomationExecutionLog(models.Model):

    class Status(models.TextChoices):
        STARTED = "STARTED", "Started"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        SKIPPED = "SKIPPED", "Skipped"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    execution = models.ForeignKey(
        AutomationExecution,
        on_delete=models.CASCADE,
        related_name="logs"
    )

    node = models.ForeignKey(
        AutomationNode,
        on_delete=models.CASCADE
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices
    )

    message = models.TextField(
        blank=True
    )

    started_at = models.DateTimeField(
        auto_now_add=True
    )

    finished_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = "automation_execution_log"

        indexes = [
            models.Index(fields=["execution"]),
            models.Index(fields=["node"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.execution.id} - {self.status}"