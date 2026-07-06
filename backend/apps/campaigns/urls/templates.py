from django.urls import path

from apps.campaigns.views import (
    TemplateCreateAPIView,
    TemplateListAPIView
)

urlpatterns = [
    path(
        "",
        TemplateListAPIView.as_view(),
        name="template-list",
    ),

    path(
        "create/",
        TemplateCreateAPIView.as_view(),
        name="template-create",
    )
]