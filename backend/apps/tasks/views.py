from django.shortcuts import render

# Create your views here.
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.accounts.models import MAUser
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
    MyTaskSerializer,
    TaskUpdateSerializer,
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
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        task = create_task(
            title=serializer.validated_data["title"],

            description=serializer.validated_data.get(
                "description",
            ),

            instructions=serializer.validated_data.get(
                "instructions",
            ),

            audience=serializer.validated_data["audience"],

            channels=serializer.validated_data["channels"],   # NEW

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
            MyTaskSerializer(
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


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminManager]

    def get_object(self, request, task_id):
        role = MAUser.objects.filter(user=request.user).values_list("role", flat=True).first()
        queryset = Task.objects.filter(is_active=True, is_deleted=False)
        if role != "SUPER_ADMIN":
            queryset = queryset.filter(created_by=request.user)
        return get_object_or_404(queryset, id=task_id)

    def get(self, request, task_id):
        return Response(TaskSerializer(self.get_object(request, task_id)).data)

    def patch(self, request, task_id):
        task = self.get_object(request, task_id)
        serializer = TaskUpdateSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(TaskSerializer(task).data)

    def delete(self, request, task_id):
        task = self.get_object(request, task_id)
        task.is_active = False
        task.is_deleted = True
        task.save(update_fields=["is_active", "is_deleted", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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

        ma_user = MAUser.objects.filter(
            user_id=request.user
        ).first()

        if (
            assignment.task.created_by != request.user
            and (
                not ma_user
                or ma_user.role != "SUPER_ADMIN"
            )
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

        ma_user = MAUser.objects.filter(
            user_id=request.user
        ).first()

        if (
            assignment.task.created_by != request.user
            and (
                not ma_user
                or ma_user.role != "SUPER_ADMIN"
            )
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
    
