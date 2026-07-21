from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import MAUser, User
from apps.campaigns.models import Audience, Channel, CustomerUpload
from apps.tasks.models import Task, TaskAssignment


class AdminTaskManagementAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="task-admin@example.com",
            password="StrongPass123!",
            first_name="Task",
            last_name="Admin",
        )
        self.admin_role = MAUser.objects.create(user=self.admin, role="ADMIN")
        self.user = self.create_team_user("first-user@example.com", "First", "User")
        self.replacement = self.create_team_user(
            "replacement-user@example.com",
            "Replacement",
            "User",
        )
        upload = CustomerUpload.objects.create(
            file_name="task-audience.csv",
            uploaded_by=self.admin,
            status=CustomerUpload.Status.COMPLETED,
        )
        self.audience = Audience.objects.create(
            name="Task audience",
            customer_upload=upload,
            created_by=self.admin,
        )
        self.channel = Channel.objects.create(name="Email", code="EMAIL")
        self.client.force_authenticate(self.admin)

    def create_team_user(self, email, first_name, last_name):
        user = User.objects.create_user(
            email=email,
            password="StrongPass123!",
            first_name=first_name,
            last_name=last_name,
        )
        MAUser.objects.create(user=user, role="USER", managed_by=self.admin_role)
        return user

    def task_payload(self):
        return {
            "title": "Launch newsletter",
            "description": "Prepare and send the July newsletter.",
            "audience": self.audience.id,
            "channels": [self.channel.id],
            "priority": "HIGH",
            "due_date": (timezone.now() + timedelta(days=3)).isoformat(),
            "users": [self.user.id],
        }

    def test_admin_can_create_edit_and_soft_delete_a_task(self):
        created = self.client.post(reverse("create-task"), self.task_payload(), format="json")
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        task_id = created.data["id"]
        self.assertTrue(
            TaskAssignment.objects.filter(task_id=task_id, user=self.user).exists()
        )

        listed = self.client.get(reverse("team-tasks"))
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual([task["id"] for task in listed.data], [task_id])

        updated = self.client.patch(
            reverse("task-detail", kwargs={"task_id": task_id}),
            {
                "title": "Updated newsletter",
                "priority": "URGENT",
                "users": [self.replacement.id],
            },
            format="json",
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["title"], "Updated newsletter")
        self.assertEqual(updated.data["priority"], "URGENT")
        self.assertEqual(updated.data["assignments"][0]["user"], self.replacement.id)
        self.assertEqual(updated.data["assignments"][0]["user_name"], "Replacement User")

        deleted = self.client.delete(
            reverse("task-detail", kwargs={"task_id": task_id})
        )
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        task = Task.objects.get(id=task_id)
        self.assertTrue(task.is_deleted)
        self.assertFalse(task.is_active)
        self.assertEqual(self.client.get(reverse("team-tasks")).data, [])
