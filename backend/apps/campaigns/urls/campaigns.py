from django.urls import path

from apps.campaigns.views.campaign import (
    CampaignCreateAPIView,
    CampaignDetailAPIView,
    CampaignUpdateAPIView,
    CampaignDeleteAPIView,
    CampaignSubmitAPIView,
    CampaignApproveAPIView,
    CampaignRejectAPIView,
    PendingApprovalAPIView,
    MyCampaignsAPIView,
    CampaignWorkspaceSummaryAPIView,
)

from apps.campaigns.views import (
    CampaignTemplateAssignAPIView,
    CampaignPreviewAPIView,
    CampaignScheduleAPIView,
    CampaignScheduleUpdateAPIView,
    CampaignSendAPIView,
    CampaignAnalyticsAPIView,
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
        "summary/",
        CampaignWorkspaceSummaryAPIView.as_view(),
        name="campaign-workspace-summary",
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

    path(
        "pending-approval/",
        PendingApprovalAPIView.as_view(),
        name="campaign-pending-approval",
    ),

    path(
        "<int:campaign_id>/update/",
        CampaignUpdateAPIView.as_view(),
        name="campaign-update",
    ),
    path(
        "<int:campaign_id>/delete/",
        CampaignDeleteAPIView.as_view(),
        name="campaign-delete",
    ),
    path(
        "<int:campaign_id>/schedule/",
        CampaignScheduleUpdateAPIView.as_view(),
        name="campaign-schedule-update",
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
    path(
        "<int:campaign_id>/detail/",
        CampaignDetailAPIView.as_view(),
        name="campaign-detail",
    ),
]
