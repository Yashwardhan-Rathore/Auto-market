from .customer import (
    CampaignCreateAPIView,
    CustomerUploadAPIView,
    CustomerUploadListAPIView,
)
from .channel import AssignChannelsView

from .audience import AudiencePreviewAPIView,    AudienceCreateAPIView,AudienceListAPIView

from .template import (
    TemplateCreateAPIView,
    TemplateListAPIView,
    CampaignTemplateAssignAPIView
)
from .preview import CampaignPreviewAPIView

from .schedule import CampaignScheduleAPIView

from .send import CampaignSendAPIView

from .analytics import CampaignAnalyticsAPIView