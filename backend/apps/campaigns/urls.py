from django.urls import path, include

urlpatterns = [
    
    path("api/campaigns/", include("apps.campaigns.urls")),
]