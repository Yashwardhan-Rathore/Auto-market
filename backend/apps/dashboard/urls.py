from django.urls import path
from apps.dashboard.views import DashboardAPIView, SuperAdminStatsView

urlpatterns = [
    path(
        "",
        DashboardAPIView.as_view(),
        name="dashboard",
    ),
    path(
        "stats/",
        SuperAdminStatsView.as_view(),
        name="dashboard-stats",
    ),
]