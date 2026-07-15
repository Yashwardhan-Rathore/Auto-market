from .customer import (
    CustomerUploadSerializer,
    CustomerUploadListSerializer,
)

from .campaign import (
    CampaignCreateSerializer,
    CampaignInfoSerializer,
    CampaignSummarySerializer,
    ChannelAnalyticsSerializer,
    CustomerSerializer,
    RecentDeliverySerializer,
    CampaignAnalyticsSerializer,
    CampaignPreviewSerializer,
    CampaignSendSerializer,
    CampaignSubmitSerializer,
    CampaignApproveSerializer,
    CampaignRejectSerializer,
    PendingApprovalSerializer,
    MyCampaignListSerializer,
)

from .channel import CampaignChannelSerializer

from .audience import AudiencePreviewSerializer , AudienceCreateSerializer,AudienceSerializer

from .template import (
    TemplateCreateSerializer,
    TemplateSerializer,
CampaignTemplateAssignSerializer

)

from .schedule import CampaignScheduleSerializer