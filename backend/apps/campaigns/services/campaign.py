from rest_framework.exceptions import PermissionDenied

from apps.tasks.models import TaskAssignment

from ..models import Campaign


class CampaignService:

    @staticmethod
    def create_campaign(validated_data, user):
        task = validated_data["task"]

        # Only USER can create campaigns
        if user.role != "USER":
            raise PermissionDenied(
                "Only marketing users can create campaigns."
            )

        # USER must be assigned to the task
        assigned = TaskAssignment.objects.filter(
            task=task,
            user=user,
        ).exists()

        if not assigned:
            raise PermissionDenied(
                "You are not assigned to this task."
            )

        return Campaign.objects.create(
            task=task,
            name=validated_data["name"],
            description=validated_data.get("description"),
            created_by=user,
        )