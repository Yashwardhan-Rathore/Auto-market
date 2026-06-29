from django.contrib import admin

# Register your models here.
from .models import (
    Task,
    TaskAssignment,
    TaskComment,
    TaskAttachment,
)

class TaskAssignmentInline(
    admin.TabularInline
):

    model = TaskAssignment

    extra = 0

    readonly_fields = (
        "created_at",
        "updated_at",
        "submitted_at",
        "approved_at",
    )

    show_change_link = True

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "priority",
        "created_by",
        "due_date",
        "is_active",
        "created_at",
    )

    list_filter = (
        "priority",
        "is_active",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "created_by__email",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    inlines = [
        TaskAssignmentInline,
    ]

@admin.register(TaskAssignment)
class TaskAssignmentAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "task",
        "user",
        "status",
        "approved_by",
        "submitted_at",
        "approved_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "task__title",
        "user__email",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "submitted_at",
        "approved_at",
    )

    ordering = (
        "-created_at",
    )

@admin.register(TaskComment)
class TaskCommentAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "assignment",
        "created_by",
        "created_at",
    )

    search_fields = (
        "comment",
        "created_by__email",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = (
        "-created_at",
    )

@admin.register(TaskAttachment)
class TaskAttachmentAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "assignment",
        "uploaded_by",
        "uploaded_at",
    )

    readonly_fields = (
        "uploaded_at",
    )

    ordering = (
        "-uploaded_at",
    )

