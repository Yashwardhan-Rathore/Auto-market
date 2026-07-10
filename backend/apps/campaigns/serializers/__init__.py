from .customer import (
    CustomerUploadSerializer,
    CustomerUploadListSerializer,
)

from .campaign import (
    CampaignCreateSerializer,
    CampaignRetrieveUpdateSerializer,
    CampaignPreviewSerializer,
    CampaignSendSerializer,
    CampaignAnalyticsSerializer
)

from .channel import CampaignChannelSerializer, ChannelListSerializer

from .audience import AudiencePreviewSerializer , AudienceCreateSerializer,AudienceSerializer

from .template import (
    TemplateCreateSerializer,
    TemplateSerializer,
CampaignTemplateAssignSerializer

)

from .schedule import CampaignScheduleSerializer