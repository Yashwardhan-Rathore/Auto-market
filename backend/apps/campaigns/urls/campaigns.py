from django.urls import path

from apps.campaigns.views.campaign import (
    CampaignCreateAPIView,
    CampaignSubmitAPIView,
    CampaignApproveAPIView,
    CampaignRejectAPIView,
    PendingApprovalAPIView,
    MyCampaignsAPIView,
)

from apps.campaigns.views import (
    CampaignTemplateAssignAPIView,
    CampaignPreviewAPIView,
    CampaignScheduleAPIView,
    CampaignSendAPIView,
    CampaignAnalyticsAPIView,
    CampaignDeleteAPIView,
    CampaignRetrieveUpdateAPIView,
)

urlpatterns = [
    path(
        "create/",
        CampaignCreateAPIView.as_view(),
        name="campaign-create",
    ),
    path(
        "my/",
        MyCampaignsAPIView.as_view(),
        name="campaign-my",
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

    path(
        "pending-approval/",
        PendingApprovalAPIView.as_view(),
        name="campaign-pending-approval",
    ),

    path(
        "<int:campaign_id>/submit/",
        CampaignSubmitAPIView.as_view(),
        name="campaign-submit",
    ),
    path(
        "<int:campaign_id>/approve/",
        CampaignApproveAPIView.as_view(),
        name="campaign-approve",
    ),
    path(
        "<int:campaign_id>/reject/",
        CampaignRejectAPIView.as_view(),
        name="campaign-reject",
    ),
]