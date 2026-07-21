from django.urls import path

from .views import (
    CreateTaskView,
    MyTasksView,
    TeamTasksView,
    UpdateTaskStatusView,
    ApproveTaskView,
    RejectTaskView,
    TaskDetailView,
)

urlpatterns = [

    # Admin creates task
    path(
        "",
        CreateTaskView.as_view(),
        name="create-task",
    ),

    # User tasks
    path(
        "my/",
        MyTasksView.as_view(),
        name="my-tasks",
    ),

    # Admin team tasks
    path(
        "team/",
        TeamTasksView.as_view(),
        name="team-tasks",
    ),
    path(
        "<int:task_id>/",
        TaskDetailView.as_view(),
        name="task-detail",
    ),

    # User updates status
    path(
        "assignment/<int:assignment_id>/",
        UpdateTaskStatusView.as_view(),
        name="update-task-status",
    ),

    # Admin approves
    path(
        "assignment/<int:assignment_id>/approve/",
        ApproveTaskView.as_view(),
        name="approve-task",
    ),

    # Admin rejects
    path(
        "assignment/<int:assignment_id>/reject/",
        RejectTaskView.as_view(),
        name="reject-task",
    ),
]

