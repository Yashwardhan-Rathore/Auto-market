from django.urls import path

from apps.campaigns.views import (
    CampaignCreateAPIView,CampaignListAPIView,CampaignTemplateAssignAPIView,
    CampaignPreviewAPIView,
    CampaignScheduleAPIView,
    CampaignSendAPIView,
    CampaignAnalyticsAPIView,
    CampaignDeleteAPIView,
    CampaignRetrieveUpdateAPIView,
)

urlpatterns = [
    path(
        "",
        CampaignListAPIView.as_view(),
        name="campaign-list",
    ),
    path(
        "create/",
        CampaignCreateAPIView.as_view(),
        name="campaign-create",
    ),
    path(
        "templates/assign/",
        CampaignTemplateAssignAPIView.as_view(),
        name="campaign-template-assign",
    ),
    path(
    "schedule/",
    CampaignScheduleAPIView.as_view(),
    name="campaign-schedule",
    ),
    path(
        "preview/",
        CampaignPreviewAPIView.as_view(),
        name="campaign-preview",
    ),
    path(
    "send/",
    CampaignSendAPIView.as_view(),
    name="campaign-send",
    ),

    path("<int:campaign_id>/analytics/",
    CampaignAnalyticsAPIView.as_view(),
    name="campaign-analytics",
    ),
    path("<int:campaign_id>/delete/",
        CampaignDeleteAPIView.as_view(),
        name="campaign-delete",
    ),
    path("<int:id>/",
        CampaignRetrieveUpdateAPIView.as_view(),
        name="campaign-detail",
    ),

]