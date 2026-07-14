from .customer import (
    CustomerUploadSerializer,
    CustomerUploadListSerializer,
)

from .campaign import (
    CampaignCreateSerializer,
    CampaignPreviewSerializer,
    CampaignSendSerializer,
    CampaignInfoSerializer,
    CampaignSummarySerializer,
    ChannelAnalyticsSerializer,
    RecentDeliverySerializer,
    CampaignAnalyticsSerializer,
    CampaignSubmitSerializer,
    CampaignApproveSerializer,
    CampaignRejectSerializer,
    PendingApprovalSerializer,
)

from .channel import CampaignChannelSerializer

from .audience import AudiencePreviewSerializer , AudienceCreateSerializer,AudienceSerializer

from .template import (
    TemplateCreateSerializer,
    TemplateSerializer,
CampaignTemplateAssignSerializer

)

from .schedule import CampaignScheduleSerializer