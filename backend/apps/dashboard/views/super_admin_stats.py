from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import logging
from apps.accounts.permissions import IsSuperAdmin
from apps.dashboard.services.super_admin_stats import SuperAdminStatsService

logger = logging.getLogger(__name__)

class SuperAdminStatsView(APIView):
    """
    Returns dashboard statistics for Super Admin.
    Accessible only by SUPER_ADMIN.
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        try:
            stats = SuperAdminStatsService.get_stats()
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching super admin stats: {str(e)}")
            return Response(
                {"detail": "An internal server error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
