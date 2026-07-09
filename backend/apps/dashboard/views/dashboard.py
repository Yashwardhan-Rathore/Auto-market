from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.dashboard.serializers import DashboardSerializer
from apps.dashboard.services.dashboard import DashboardService


class DashboardAPIView(APIView):
    """
    Dashboard API.
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        dashboard = DashboardService.get_dashboard(request.user)

        serializer = DashboardSerializer(
            dashboard,
        )

        return Response(
            serializer.data,
        )