from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
import secrets

from .models import AccessRequest
from django.db import transaction

from django.conf import settings
from django.core.mail import send_mail

from rest_framework.exceptions import ValidationError


User = get_user_model()

@transaction.atomic
def approve_access_request(request_id,role,approved_by):
    access_request = get_object_or_404(AccessRequest,pk=request_id,status="PENDING")
    temporary_password = secrets.token_urlsafe(8)
    if User.objects.filter(email=access_request.email).exists():
        raise ValidationError(
            {
                "email": "A user with this email already exists."
            }
        )
    user = User.objects.create_user(
    email=access_request.email,
    password=temporary_password,
)
    user.role = role
    user.save()
    access_request.status = "APPROVED"
    access_request.approved_by = approved_by
    access_request.approved_at = timezone.now()
    access_request.save()
    send_welcome_email(
    email=user.email,
    temporary_password=temporary_password,
    )
    return {
        "access_request": access_request,
        "user": user,
        "temporary_password": temporary_password,
    }




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

@transaction.atomic
def reject_access_request(
    request_id,
    reason,
    rejected_by,
):
    access_request = get_object_or_404(
        AccessRequest,
        pk=request_id,
        status="PENDING",
    )

    access_request.status = "REJECTED"
    access_request.rejection_reason = reason

    access_request.approved_by = rejected_by
    access_request.approved_at = timezone.now()

    access_request.save()

    return access_request