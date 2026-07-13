from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager

class User(AbstractUser):
    username = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True,
    )

    email = models.EmailField(unique=True)

    company = models.ForeignKey(
        "common.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    department = models.ForeignKey(
        "common.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

class MAUser(models.Model):

    ROLE_CHOICES = [
        ("SUPER_ADMIN", "Super Admin"),
        ("ADMIN", "Admin"),
        ("USER", "User"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ma_users",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="USER",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    managed_by = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="managed_users",
    )

    def __str__(self):
        if self.user_id:
            return f"{self.user_id.email} ({self.role})"
        return "No User"
    

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_reset_otps",
    )
    otp = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_ma_user_for_superuser(sender, instance, created, **kwargs):
    if created and instance.is_superuser:
        MAUser.objects.get_or_create(
            user=instance,
            defaults={"role": "SUPER_ADMIN"}
        )
