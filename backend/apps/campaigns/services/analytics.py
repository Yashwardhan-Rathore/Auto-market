from django.db.models import Count, Q
from django.db.models.functions import TruncDate

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
            "daily_series": cls._get_daily_series(deliveries),
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
    def _get_channel_summary(deliveries):
        """
        Channel-wise analytics.
        """

        rows = (
            deliveries.values(
                "channel__id",
                "channel__name",
            )
            .annotate(
                total=Count("id"),
                sent=Count(
                    "id",
                    filter=Q(status=CampaignDelivery.Status.SENT),
                ),
                failed=Count(
                    "id",
                    filter=Q(status=CampaignDelivery.Status.FAILED),
                ),
                pending=Count(
                    "id",
                    filter=Q(status=CampaignDelivery.Status.PENDING),
                ),
                delivered=Count(
                    "id",
                    filter=Q(status=CampaignDelivery.Status.DELIVERED),
                ),
            )
            .order_by("channel__name")
        )

        return [
        {
            "id": row["channel__id"],
            "name": row["channel__name"],
            "total": row["total"],
            "sent": row["sent"],
            "failed": row["failed"],
            "pending": row["pending"],
            "delivered": row["delivered"],
        }
        for row in rows
    ]

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

        rows = (
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

        return [
            {
                "id": row["id"],
                "customer": {
                    "id": row["customer__id"],
                    "data": row["customer__data"],
                },
                "channel": row["channel__name"],
                "status": row["status"],
                "provider_message_id": row["provider_message_id"],
                "sent_at": row["sent_at"],
            }
            for row in rows
        ]

    # ==========================================================
    # Daily Time Series
    # ==========================================================

    @staticmethod
    def _get_daily_series(deliveries):
        """
        Return daily sent / delivered / failed counts for a sparkline chart.
        """
        rows = (
            deliveries.filter(sent_at__isnull=False)
            .annotate(day=TruncDate("sent_at"))
            .values("day")
            .annotate(
                sent=Count(
                    "id",
                    filter=Q(status__in=[
                        CampaignDelivery.Status.SENT,
                        CampaignDelivery.Status.DELIVERED,
                    ]),
                ),
                delivered=Count(
                    "id",
                    filter=Q(status=CampaignDelivery.Status.DELIVERED),
                ),
                failed=Count(
                    "id",
                    filter=Q(status=CampaignDelivery.Status.FAILED),
                ),
            )
            .order_by("day")
        )

        return [
            {
                "date": str(row["day"]),
                "sent": row["sent"],
                "delivered": row["delivered"],
                "failed": row["failed"],
            }
            for row in rows
        ]

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