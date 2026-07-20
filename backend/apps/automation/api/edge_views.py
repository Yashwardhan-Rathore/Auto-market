from rest_framework.response import Response
from rest_framework.views import APIView

from apps.automation.models import (
    Automation, AutomationEdge
)

from .node_serializers import (
    AutomationEdgeSerializer
)
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from apps.automation.services.permissions import can_edit


class AutomationEdgeCreateView(
    APIView
):

    def post(
        self,
        request,
        automation_id,
    ):

        automation = get_object_or_404(Automation, pk=automation_id)
        if not can_edit(request.user, automation):
            raise PermissionDenied("You do not have permission to edit this automation.")

        serializer = (
            AutomationEdgeSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        if (
            serializer.validated_data["source_node"].automation_id != automation.id
            or serializer.validated_data["target_node"].automation_id != automation.id
        ):
            raise PermissionDenied("Edge nodes must belong to this automation.")

        serializer.save(
            automation=automation
        )

        return Response(
            serializer.data,
            status=201,
        )


class AutomationEdgeDeleteView(
    APIView
):

    def delete(
        self,
        request,
        pk,
    ):

        edge = get_object_or_404(AutomationEdge.objects.select_related("automation"), pk=pk)
        if not can_edit(request.user, edge.automation):
            raise PermissionDenied("You do not have permission to edit this automation.")

        edge.delete()

        return Response(
            status=204
        )
