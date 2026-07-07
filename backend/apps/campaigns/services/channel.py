from apps.campaigns.models import (
    Campaign,
    Channel,
    CampaignChannel,
)


def assign_channels(
    *,
    campaign: Campaign,
    channel_ids: list[int],
):
    """
    Replace all channels for a campaign.
    """

    # Get selected channels
    channels = Channel.objects.filter(
        id__in=channel_ids,
        is_active=True,
    )

    # Remove previous selections
    CampaignChannel.objects.filter(
        campaign=campaign,
    ).delete()

    # Create new relations
    campaign_channels = [
        CampaignChannel(
            campaign=campaign,
            channel=channel,
        )
        for channel in channels
    ]

    CampaignChannel.objects.bulk_create(
        campaign_channels
    )

    return campaign