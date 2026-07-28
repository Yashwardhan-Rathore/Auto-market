from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response


class DashboardView(APIView):

    def get(self, request):
        from django.utils.dateparse import parse_date
        from .services import get_dashboard

        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        parsed_from = parse_date(date_from) if date_from else None
        parsed_to = parse_date(date_to) if date_to else None

        data = get_dashboard(request.user, date_from=parsed_from, date_to=parsed_to)
        return Response(data)