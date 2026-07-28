import logging

from django.db import OperationalError, connections
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analytics.services.metrics import all_metrics

logger = logging.getLogger(__name__)


class AnalyticsSummaryView(APIView):
    def get(self, request):
        date_from = parse_date(request.query_params.get("date_from", "")) or None
        date_to = parse_date(request.query_params.get("date_to", "")) or None

        # Analytics is a read-only operation, so retrying the complete metric
        # calculation once is safe when a pooled Neon connection disappears
        # between queries. Writes must not use this retry pattern.
        try:
            metrics = all_metrics(request.user, date_from=date_from, date_to=date_to)
        except OperationalError:
            logger.warning(
                "Database connection dropped while calculating analytics; retrying once."
            )
            connections["default"].close()
            metrics = all_metrics(request.user, date_from=date_from, date_to=date_to)

        return Response(metrics)

