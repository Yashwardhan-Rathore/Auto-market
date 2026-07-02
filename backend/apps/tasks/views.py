from django.shortcuts import render

# Create your views here.
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Task,
    TaskAssignment,
)

from .serializers import (
    TaskSerializer,
    CreateTaskSerializer,
    TaskAssignmentSerializer,
    UpdateTaskStatusSerializer,
    ApprovalSerializer,
)

from .permissions import (
    IsAdminManager,
)

from .services import (
    create_task,
    get_user_tasks,
    get_admin_tasks,
    start_task,
    submit_task,
    approve_task,
    reject_task,
)


class CreateTaskView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminManager,
    ]

    def post(self, request):

        serializer = CreateTaskSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        task = create_task(
    title=serializer.validated_data["title"],

    description=serializer.validated_data.get(
        "description"
    ),

    instructions=serializer.validated_data.get(
        "instructions"
    ),

    audience=serializer.validated_data["audience"],

    priority=serializer.validated_data["priority"],

    due_date=serializer.validated_data["due_date"],

    created_by=request.user,

    users=serializer.validated_data["users"],
)
        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_201_CREATED,
        )
    
class MyTasksView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):

        tasks = get_user_tasks(
            request.user
        )

        serializer = (
            TaskAssignmentSerializer(
                tasks,
                many=True,
            )
        )

        return Response(
            serializer.data
        )
    

class TeamTasksView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminManager,
    ]

    def get(self, request):

        tasks = get_admin_tasks(
            request.user
        )

        serializer = TaskSerializer(
            tasks,
            many=True,
        )

        return Response(
            serializer.data
        )
    

class UpdateTaskStatusView(
    APIView
):

    permission_classes = [
        IsAuthenticated,
    ]

    def patch(
        self,
        request,
        assignment_id,
    ):

        assignment = (
            get_object_or_404(
                TaskAssignment,
                id=assignment_id,
                user=request.user,
            )
        )

        serializer = (
            UpdateTaskStatusSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        new_status = (
            serializer.validated_data[
                "status"
            ]
        )

        if (
            new_status
            == "IN_PROGRESS"
        ):

            assignment = (
                start_task(
                    assignment
                )
            )

        elif (
            new_status
            == "SUBMITTED"
        ):

            assignment = (
                submit_task(
                    assignment,
                    serializer.validated_data.get(
                        "remarks"
                    ),
                )
            )

        return Response(
            TaskAssignmentSerializer(
                assignment
            ).data
        )

class ApproveTaskView(
    APIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminManager,
    ]

    def post(
        self,
        request,
        assignment_id,
    ):

        assignment = (
            get_object_or_404(
                TaskAssignment,
                id=assignment_id,
            )
        )

        if (
            assignment.task.created_by
            != request.user
            and request.user.role
            != "SUPER_ADMIN"
        ):

            return Response(
                {
                    "detail":
                    "Permission denied."
                },
                status=403,
            )

        serializer = (
            ApprovalSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        assignment = (
            approve_task(
                assignment,
                request.user,
                serializer.validated_data.get(
                    "remarks"
                ),
            )
        )

        return Response(
            TaskAssignmentSerializer(
                assignment
            ).data
        )
    
class RejectTaskView(
    APIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminManager,
    ]

    def post(
        self,
        request,
        assignment_id,
    ):

        assignment = (
            get_object_or_404(
                TaskAssignment,
                id=assignment_id,
            )
        )

        if (
            assignment.task.created_by
            != request.user
            and request.user.role
            != "SUPER_ADMIN"
        ):

            return Response(
                {
                    "detail":
                    "Permission denied."
                },
                status=403,
            )

        serializer = (
            ApprovalSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        assignment = (
            reject_task(
                assignment,
                request.user,
                serializer.validated_data.get(
                    "remarks"
                ),
            )
        )

        return Response(
            TaskAssignmentSerializer(
                assignment
            ).data
        )
    
