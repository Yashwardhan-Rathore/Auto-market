from django.urls import path
from .views import CustomerUploadAPIView , CustomerUploadListAPIView , CampaignCreateAPIView,AssignChannelsView , AudiencePreviewAPIView , AudienceListAPIView , AudienceCreateAPIView

urlpatterns = [
    path("customer/upload/",CustomerUploadAPIView.as_view(),name="customer-upload"),
    path("customer/uploads/",CustomerUploadListAPIView.as_view(),name="customer-upload-list"),
    path("",CampaignCreateAPIView.as_view(),name="campaign-create"),
    path("<int:campaign_id>/channels/",AssignChannelsView.as_view(),name="assign-channels"),
    path("audience/preview/",AudiencePreviewAPIView.as_view(),  name="audience-preview"),
    path("audiences/",AudienceListAPIView.as_view(),
    name="audience-list"),
    path("audiences/create/",AudienceCreateAPIView.as_view(),
    name="audience-create",
),
]