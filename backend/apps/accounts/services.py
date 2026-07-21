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

import random
from django.core.cache import cache
from django.contrib.auth.hashers import make_password, check_password

class OTPService:
    CACHE_KEY_PREFIX = "password_reset_otp_"
    TIMEOUT_SECONDS = 300  # 5 minutes

    @classmethod
    def get_cache_key(cls, email):
        return f"{cls.CACHE_KEY_PREFIX}{email}"

    @classmethod
    def generate_and_cache_otp(cls, email):
        """
        Generates a 6-digit OTP, hashes it, stores the hash in cache,
        and returns the plaintext OTP (to be sent to the user).
        """
        otp = f"{random.SystemRandom().randint(100000, 999999)}"
        hashed_otp = make_password(otp)
        
        cache_key = cls.get_cache_key(email)
        cache.set(cache_key, hashed_otp, timeout=cls.TIMEOUT_SECONDS)
        
        return otp

    @classmethod
    def verify_and_delete_otp(cls, email, otp_input):
        """
        Retrieves the hashed OTP from cache, verifies the input, 
        and deletes the OTP from cache if valid.
        Returns a tuple: (is_valid, error_message)
        """
        cache_key = cls.get_cache_key(email)
        hashed_otp = cache.get(cache_key)
        
        if not hashed_otp:
            return False, "OTP expired or does not exist."
            
        if not check_password(otp_input, hashed_otp):
            return False, "Invalid OTP."
            
        # OTP is valid, remove it to prevent reuse
        cache.delete(cache_key)
        return True, None

import logging
from django.http import Http404
from rest_framework.exceptions import PermissionDenied

logger = logging.getLogger(__name__)

class UserManagementService:

    @classmethod
    @transaction.atomic
    def delete_admin(cls, request_user, target_id):
        from apps.common.ownership import is_super_admin
        if not is_super_admin(request_user):
            raise PermissionDenied("You do not have permission to perform this action.")

        try:
            target_user = User.objects.get(id=target_id)
        except User.DoesNotExist:
            raise Http404("User not found.")

        target_ma_user = MAUser.objects.filter(user=target_user).first()
        if not target_ma_user or target_ma_user.role != "ADMIN":
            raise ValidationError({"detail": "Only Admin accounts can be deleted using this endpoint."})

        target_email = target_user.email
        target_user.delete()
        logger.info(f"Admin {target_email} deleted by Super Admin {request_user.email}.")

    @classmethod
    @transaction.atomic
    def delete_user(cls, request_user, target_id):
        try:
            target_user = User.objects.get(id=target_id)
        except User.DoesNotExist:
            raise Http404("User not found.")

        target_ma_user = MAUser.objects.filter(user=target_user).first()
        if not target_ma_user or target_ma_user.role != "USER":
            raise ValidationError({"detail": "Only User accounts can be deleted using this endpoint."})

        from apps.common.ownership import is_managed_user
        if not is_managed_user(request_user, target_user):
            raise PermissionDenied("You do not have permission to delete this user.")

        target_email = target_user.email
        target_user.delete()
        
        from apps.common.ownership import get_admin_profile
        admin_profile = get_admin_profile(request_user)
        role = admin_profile.role if admin_profile else "SUPER_ADMIN"
        
        logger.info(f"User {target_email} deleted by {role} {request_user.email}.")

    @classmethod
    def get_admins_queryset(cls):
        """Returns a queryset of User objects with role ADMIN, optimized with prefetch_related."""
        return User.objects.filter(ma_users__role="ADMIN", is_active=True).prefetch_related("ma_users")

    @classmethod
    def get_users_queryset(cls, request_user=None):
        """Returns a queryset of User objects with role USER, isolated by admin."""
        if not request_user:
            return User.objects.none()
        from apps.common.ownership import get_managed_users_queryset
        return get_managed_users_queryset(request_user)
