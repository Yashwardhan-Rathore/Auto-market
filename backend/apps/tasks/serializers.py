from rest_framework import serializers

from .models import (
    Task,
    TaskAssignment,
    TaskComment,
    TaskAttachment,
)

class TaskAttachmentSerializer(serializers.ModelSerializer):

    uploaded_by_name = serializers.CharField(
        source="uploaded_by.email",
        read_only=True
    )

    class Meta:
        model = TaskAttachment

        fields = [
            "id",
            "file",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
        ]

        read_only_fields = [
            "uploaded_by",
            "uploaded_at",
        ]


class TaskCommentSerializer(serializers.ModelSerializer):

    created_by_name = serializers.CharField(
        source="created_by.email",
        read_only=True
    )

    class Meta:
        model = TaskComment

        fields = [
            "id",
            "comment",
            "created_by",
            "created_by_name",
            "created_at",
        ]

        read_only_fields = [
            "created_by",
            "created_at",
        ]


class TaskAssignmentSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source="user.email",
        read_only=True
    )

    approved_by_name = serializers.CharField(
        source="approved_by.email",
        read_only=True
    )

    comments = TaskCommentSerializer(
        many=True,
        read_only=True,
    )

    attachments = TaskAttachmentSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = TaskAssignment

        fields = [
            "id",

            "user",
            "user_name",

            "status",

            "remarks",

            "submitted_at",

            "approved_at",

            "approved_by",
            "approved_by_name",

            "comments",

            "attachments",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "approved_by",
            "approved_at",
            "submitted_at",
            "created_at",
            "updated_at",
        ]


class CreateTaskSerializer(serializers.ModelSerializer):

    users = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
    )

    class Meta:
        model = Task

        fields = [
            "id",

            "title",
            "description",
            "priority",
            "due_date",

            "users",
        ]


class TaskSerializer(serializers.ModelSerializer):

    created_by_name = serializers.CharField(
        source="created_by.email",
        read_only=True
    )

    assignments = TaskAssignmentSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Task

        fields = [
            "id",

            "title",
            "description",

            "priority",

            "due_date",

            "created_by",
            "created_by_name",

            "assignments",

            "created_at",
            "updated_at",
        ]

class UpdateTaskStatusSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=[
            "IN_PROGRESS",
            "SUBMITTED",
        ]
    )

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
    )


class ApprovalSerializer(serializers.Serializer):

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
    )

