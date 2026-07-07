from django.contrib import admin

from .models import (
    Audience,
    Campaign,
    CampaignChannel,
    CampaignTemplate,
    Channel,
    CustomerRecord,
    CustomerUpload,
    Template,
)

admin.site.register(CustomerUpload)
admin.site.register(CustomerRecord)
admin.site.register(Audience)
admin.site.register(Campaign)
admin.site.register(Channel)
admin.site.register(CampaignChannel)
admin.site.register(Template)
admin.site.register(CampaignTemplate)