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
    CampaignUpdateSerializer
)

from .channel import CampaignChannelSerializer, ChannelListSerializer

from .audience import AudiencePreviewSerializer , AudienceCreateSerializer,AudienceSerializer

from .template import (
    TemplateCreateSerializer,
    TemplateSerializer,
    CampaignTemplateAssignSerializer,
    TemplateUpdateSerializer
)

from .schedule import (
    CampaignScheduleSerializer,
    CampaignScheduleUpdateSerializer
)