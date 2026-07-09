from django.db.models import Count, Q

from apps.campaigns.models import (
    Campaign,
    CampaignDelivery,
)
from apps.common.utils import filter_by_tenant


class DashboardService:
    """
    Dashboard analytics service.
    """

    # ==========================================================
    # Public API
    # ==========================================================

    @classmethod
    def get_dashboard(cls, user):
        """
        Return dashboard data.
        """

        campaigns = cls._get_campaigns(user)
        deliveries = cls._get_deliveries(user)

        return {
            "campaigns": cls._get_campaign_stats(campaigns),
            "deliveries": cls._get_delivery_stats(deliveries),
            "recent_campaigns": cls._get_recent_campaigns(campaigns),
            "recent_deliveries": cls._get_recent_deliveries(deliveries),
        }
    
    # ==========================================================
    # Queries
    # ==========================================================

    @staticmethod
    def _get_campaigns(user):
        """
        Base queryset for campaigns.
        """

        return filter_by_tenant(Campaign.objects.all(), user, "created_by")


    @staticmethod
    def _get_deliveries(user):
        """
        Base queryset for deliveries.
        """

        return filter_by_tenant(CampaignDelivery.objects.all(), user, "campaign__created_by").select_related(
            "campaign",
            "customer",
            "channel",
        )
    
    # ==========================================================
    # Campaign Statistics
    # ==========================================================

    @staticmethod
    def _get_campaign_stats(campaigns):
        """
        Campaign statistics.
        """

        return campaigns.aggregate(
            total=Count("id"),
            draft=Count(
                "id",
                filter=Q(status=Campaign.Status.DRAFT),
            ),
            scheduled=Count(
                "id",
                filter=Q(status=Campaign.Status.SCHEDULED),
            ),
            sending=Count(
                "id",
                filter=Q(status=Campaign.Status.SENDING),
            ),
            completed=Count(
                "id",
                filter=Q(status=Campaign.Status.COMPLETED),
            ),
        )
    
    # ==========================================================
    # Delivery Statistics
    # ==========================================================

    @classmethod
    def _get_delivery_stats(
        cls,
        deliveries,
    ):
        """
        Delivery statistics.
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
    # Calculations
    # ==========================================================

    @staticmethod
    def _calculate_success_rate(
        *,
        total,
        sent,
    ):
        """
        Calculate delivery success rate.
        """

        if total == 0:
            return 0

        return round(
            (sent / total) * 100,
            2,
        )
    
    # ==========================================================
    # Recent Campaigns
    # ==========================================================

    @staticmethod
    def _get_recent_campaigns(
        campaigns,
        limit=10,
    ):
        """
        Return recently created campaigns.
        """

        rows = (
            campaigns.order_by("-created_at")
            .values(
                "id",
                "name",
                "status",
                "scheduled_at",
                "started_at",
                "completed_at",
                "created_at",
            )[:limit]
        )

        return list(rows)
    
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
            deliveries.order_by("-created_at")
            .values(
                "id",
                "campaign__id",
                "campaign__name",
                "customer__id",
                "customer__data",
                "channel__name",
                "status",
                "provider_message_id",
                "sent_at",
                "created_at",
            )[:limit]
        )

        return [
            {
                "id": row["id"],
                "campaign": {
                    "id": row["campaign__id"],
                    "name": row["campaign__name"],
                },
                "customer": {
                    "id": row["customer__id"],
                    "data": row["customer__data"],
                },
                "channel": row["channel__name"],
                "status": row["status"],
                "provider_message_id": row["provider_message_id"],
                "sent_at": row["sent_at"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]