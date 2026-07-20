from rest_framework.response import Response
from rest_framework.views import APIView

from apps.automation.models import (
    Automation, AutomationNode
)

from .node_serializers import (
    AutomationNodeSerializer
)
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from apps.automation.services.permissions import can_edit


class AutomationNodeCreateView(APIView):

    def post(
        self,
        request,
        automation_id,
    ):

        automation = get_object_or_404(Automation, pk=automation_id)
        if not can_edit(request.user, automation):
            raise PermissionDenied("You do not have permission to edit this automation.")

        serializer = (
            AutomationNodeSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            automation=automation
        )

        return Response(
            serializer.data,
            status=201,
        )


class AutomationNodeDetailView(
    APIView
):

    def patch(
        self,
        request,
        pk,
    ):

        node = get_object_or_404(AutomationNode.objects.select_related("automation"), pk=pk)
        if not can_edit(request.user, node.automation):
            raise PermissionDenied("You do not have permission to edit this automation.")

        serializer = (
            AutomationNodeSerializer(
                node,
                data=request.data,
                partial=True,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )

    def delete(
        self,
        request,
        pk,
    ):

        node = get_object_or_404(AutomationNode.objects.select_related("automation"), pk=pk)
        if not can_edit(request.user, node.automation):
            raise PermissionDenied("You do not have permission to edit this automation.")

        node.delete()

        return Response(
            status=204
        )
