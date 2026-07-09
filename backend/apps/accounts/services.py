from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
import secrets
from .models import MAUser
from django.db import transaction

from django.conf import settings
from django.core.mail import send_mail

from rest_framework.exceptions import ValidationError


User = get_user_model()


def send_welcome_email(email, temporary_password):
    subject = "Welcome to Auto Market"

    message = f"""
Hello,

Your Auto Market account has been approved.

Login Email:
{email}

Temporary Password:
{temporary_password}

Please login and change your password immediately.

Regards,
Auto Market Team
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

