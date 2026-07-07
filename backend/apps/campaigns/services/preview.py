import re

from rest_framework.exceptions import ValidationError

from apps.campaigns.models import (
    CampaignTemplate,
    CampaignAudience,
)


PREVIEW_LIMIT = 5


class TemplateRenderer:

    @staticmethod
    def render(
        text,
        customer_data,
    ):
        """
        Replace {{field}} with customer values.
        """
        if not text:
            return ""

        def replace(match):
            field = match.group(1).strip()
            return str(
                customer_data.get(field, "")
            )

        return re.sub(
            r"\{\{(.*?)\}\}",
            replace,
            text,
        )


class CampaignPreviewService:

    @staticmethod
    def preview(
        *,
        campaign,
    ):
        # Get assigned templates
        campaign_templates = CampaignTemplate.objects.filter(
            campaign=campaign,
        ).select_related(
            "template",
            "channel",
        )

        if not campaign_templates.exists():
            raise ValidationError(
                "No templates are assigned to this campaign."
            )

        # Get frozen campaign recipients
        campaign_customers = CampaignAudience.objects.filter(
            campaign=campaign,
        ).select_related(
            "customer",
        )

        if not campaign_customers.exists():
            raise ValidationError(
                "No customers found for this campaign."
            )

        preview_customers = []

        for campaign_customer in campaign_customers[:PREVIEW_LIMIT]:

            customer = campaign_customer.customer

            customer_preview = []

            for campaign_template in campaign_templates:

                template = campaign_template.template

                customer_preview.append(
                    {
                        "channel": campaign_template.channel.name,
                        "subject": TemplateRenderer.render(
                            template.subject,
                            customer.data,
                        ),
                        "body": TemplateRenderer.render(
                            template.body,
                            customer.data,
                        ),
                    }
                )

            preview_customers.append(
                {
                    "customer": customer.data,
                    "channels": customer_preview,
                }
            )

        return {
            "campaign": campaign.name,
            "total_customers": campaign_customers.count(),
            "preview": preview_customers,
        }