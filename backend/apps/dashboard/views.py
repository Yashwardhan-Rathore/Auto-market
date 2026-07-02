from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response

from .services import get_dashboard


class DashboardView(APIView):

    def get(self, request):
        data = get_dashboard(request.user)
        return Response(data)