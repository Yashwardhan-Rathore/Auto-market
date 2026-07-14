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

