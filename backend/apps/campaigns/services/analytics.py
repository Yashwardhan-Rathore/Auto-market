from django.db.models import Count, Q

from apps.campaigns.models import (
    Campaign,
    CampaignDelivery,
)


class AnalyticsService:
    """
    Campaign Analytics Service.
    """

    # ==========================================================
    # Public API
    # ==========================================================

    @classmethod
    def get_campaign_analytics(
        cls,
        *,
        campaign: Campaign,
    ):
        """
        Return complete campaign analytics.
        """

        deliveries = cls._get_deliveries(campaign)

        return {
            "campaign": cls._get_campaign_info(campaign),
            "summary": cls._get_summary(deliveries),
            "channels": cls._get_channel_summary(deliveries),
            "recent_deliveries": cls._get_recent_deliveries(deliveries),
        }

    # ==========================================================
    # Campaign
    # ==========================================================

    @staticmethod
    def _get_campaign_info(
        campaign: Campaign,
    ):
        """
        Return campaign metadata.
        """

        return {
            "id": campaign.id,
            "name": campaign.name,
            "status": campaign.status,
            "scheduled_at": campaign.scheduled_at,
            "started_at": campaign.started_at,
            "completed_at": campaign.completed_at,
        }

    # ==========================================================
    # Queries
    # ==========================================================

    @staticmethod
    def _get_deliveries(
        campaign: Campaign,
    ):
        """
        Base queryset for campaign deliveries.
        """

        return CampaignDelivery.objects.filter(
            campaign=campaign,
        )

    # ==========================================================
    # Summary
    # ==========================================================

    @classmethod
    def _get_summary(
        cls,
        deliveries,
    ):
        """
        Campaign summary statistics.
        """

        stats = deliveries.aggregate(
            total=Count("id"),
            sent=Count(
                "id",
                filter=Q(
                    status=CampaignDelivery.Status.SENT,
                ),
            ),
            failed=Count(
                "id",
                filter=Q(
                    status=CampaignDelivery.Status.FAILED,
                ),
            ),
            pending=Count(
                "id",
                filter=Q(
                    status=CampaignDelivery.Status.PENDING,
                ),
            ),
            delivered=Count(
                "id",
                filter=Q(
                    status=CampaignDelivery.Status.DELIVERED,
                ),
            ),
        )

        stats["success_rate"] = cls._calculate_success_rate(
            total=stats["total"],
            sent=stats["sent"],
        )

        return stats

    # ==========================================================
    # Channel Analytics
    # ==========================================================

    @staticmethod
    def _get_channel_summary(
        deliveries,
    ):
        """
        Channel-wise analytics.
        """

        return list(
            deliveries.values(
                "channel__id",
                "channel__name",
            )
            .annotate(
                total=Count("id"),
                sent=Count(
                    "id",
                    filter=Q(
                        status=CampaignDelivery.Status.SENT,
                    ),
                ),
                failed=Count(
                    "id",
                    filter=Q(
                        status=CampaignDelivery.Status.FAILED,
                    ),
                ),
                pending=Count(
                    "id",
                    filter=Q(
                        status=CampaignDelivery.Status.PENDING,
                    ),
                ),
                delivered=Count(
                    "id",
                    filter=Q(
                        status=CampaignDelivery.Status.DELIVERED,
                    ),
                ),
            )
            .order_by("channel__name")
        )

    # ==========================================================
    # Recent Deliveries
    # ==========================================================

    @staticmethod
    def _get_recent_deliveries(
        deliveries,
        limit=10,
    ):
        """
        Return recent delivery history.
        """

        return list(
            deliveries.select_related(
                "customer",
                "channel",
            )
            .order_by("-created_at")
            .values(
                "id",
                "customer__id",
                "customer__data",
                "channel__name",
                "status",
                "provider_message_id",
                "sent_at",
            )[:limit]
        )

    # ==========================================================
    # Calculations
    # ==========================================================

    @staticmethod
    def _calculate_success_rate(
        *,
        total,
        sent,
    ):
        """
        Calculate campaign success rate.
        """

        if total == 0:
            return 0

        return round(
            (sent / total) * 100,
            2,
        )