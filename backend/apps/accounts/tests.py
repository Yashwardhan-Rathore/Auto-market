from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import MAUser, User


class AuthenticationAPITests(APITestCase):
    password = "StrongPass123!"

    def create_role_user(self, email, role, **extra):
        user = User.objects.create_user(
            email=email,
            password=self.password,
            **extra,
        )
        MAUser.objects.create(user=user, role=role)
        return user

    def test_login_returns_tokens_and_role_without_password(self):
        self.create_role_user("user@example.com", "USER")
        response = self.client.post(
            reverse("login"),
            {"email": "user@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertEqual(data["user"]["role"], "USER")
        self.assertNotIn("password", str(response.data).lower())

    def test_refresh_route_rotates_a_valid_refresh_token(self):
        self.create_role_user("refresh@example.com", "USER")
        login = self.client.post(
            reverse("login"),
            {"email": "refresh@example.com", "password": self.password},
            format="json",
        )
        response = self.client.post(
            reverse("token_refresh"),
            {"refresh": login.data["data"]["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_super_admin_bootstrap_is_one_time_for_anonymous_clients(self):
        first = self.client.post(
            reverse("create-super-admin"),
            {"email": "root@example.com", "password": self.password},
            format="json",
        )
        second = self.client.post(
            reverse("create-super-admin"),
            {"email": "root2@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_existing_super_admin_can_create_another_super_admin(self):
        root = self.create_role_user(
            "existing-root@example.com",
            "SUPER_ADMIN",
            is_staff=True,
            is_superuser=True,
        )
        self.client.force_authenticate(root)
        response = self.client.post(
            reverse("create-super-admin"),
            {"email": "new-root@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_profile_name_can_be_updated_without_changing_role(self):
        user = self.create_role_user("profile@example.com", "USER")
        self.client.force_authenticate(user)
        response = self.client.patch(
            reverse("profile"),
            {"first_name": "Ada", "last_name": "Lovelace", "role": "SUPER_ADMIN"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Ada")
        self.assertEqual(response.data["role"], "USER")

    def test_django_superuser_without_ma_user_can_create_admin(self):
        root = User.objects.create_superuser(
            email="django-root@example.com",
            password=self.password,
        )
        self.client.force_authenticate(root)
        response = self.client.post(
            reverse("create-admin"),
            {
                "email": "created-admin@example.com",
                "password": self.password,
                "first_name": "Created",
                "last_name": "Admin",
                "mobile_no": "+91 98765 43210",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            MAUser.objects.filter(
                user__email="created-admin@example.com",
                role="ADMIN",
            ).exists()
        )
