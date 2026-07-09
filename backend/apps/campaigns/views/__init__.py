from .campaign import (
    CampaignCreateAPIView,
    CampaignListAPIView,
)
from .customer import (
    CustomerUploadAPIView,
    CustomerUploadListAPIView,
    CustomerRecordListAPIView,
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