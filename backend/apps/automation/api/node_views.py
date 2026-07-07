from rest_framework.response import Response
from rest_framework.views import APIView

from apps.automation.models import (
    AutomationNode
)

from .node_serializers import (
    AutomationNodeSerializer
)


class AutomationNodeCreateView(APIView):

    def post(
        self,
        request,
        automation_id,
    ):

        serializer = (
            AutomationNodeSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            automation_id=automation_id
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

        node = (
            AutomationNode.objects.get(
                pk=pk
            )
        )

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

        node = (
            AutomationNode.objects.get(
                pk=pk
            )
        )

        node.delete()

        return Response(
            status=204
        )