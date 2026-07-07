from rest_framework.response import Response
from rest_framework.views import APIView

from apps.automation.models import (
    AutomationEdge
)

from .node_serializers import (
    AutomationEdgeSerializer
)


class AutomationEdgeCreateView(
    APIView
):

    def post(
        self,
        request,
        automation_id,
    ):

        serializer = (
            AutomationEdgeSerializer(
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


class AutomationEdgeDeleteView(
    APIView
):

    def delete(
        self,
        request,
        pk,
    ):

        edge = (
            AutomationEdge.objects.get(
                pk=pk
            )
        )

        edge.delete()

        return Response(
            status=204
        )