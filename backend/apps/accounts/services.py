from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
import secrets

from .models import AccessRequest

User = get_user_model()

def approve_access_request(request_id,role,approved_by):
    access_request = get_object_or_404(AccessRequest,pk=request_id,status="PENDING")

    return access_request