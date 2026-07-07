from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.automation.models import (
    Automation,
)

from apps.automation.services.dispatcher import (
    dispatch_workflow,
)


class WebhookTriggerView(
    APIView
):

    permission_classes = [
        AllowAny
    ]

    authentication_classes = []

    def post(
        self,
        request,
        automation_id,
    ):

        automation = (
            Automation.objects.get(
                pk=automation_id
            )
        )

        execution = (
            dispatch_workflow(
                automation,
                None,
            )
        )

        return Response({

            "success": True,

            "execution_id":
                execution.id,

        })