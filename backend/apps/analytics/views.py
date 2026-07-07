from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analytics.services.metrics import all_metrics


class AnalyticsSummaryView(APIView):
    def get(self, request):
        return Response(
            all_metrics(request.user)
        )

