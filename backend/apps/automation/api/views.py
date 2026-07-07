from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.automation.models import (
    Automation,
)

from apps.automation.api.serializers import (
    AutomationSerializer,
)

from apps.automation.models import (
    AutomationNode,
    AutomationEdge,
)

from apps.automation.api.node_serializers import (
    AutomationNodeSerializer,
    AutomationEdgeSerializer,
)

from apps.automation.services.validator import (
    validate_workflow,
)

from apps.automation.services.dispatcher import (
    dispatch_workflow,
)


# ==========================================
# LIST + CREATE
# ==========================================

class AutomationListCreateView(
    APIView
):

    def get(self, request):

        qs = Automation.objects.filter(
            owner=request.user
        )

        serializer = (
            AutomationSerializer(
                qs,
                many=True,
            )
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = (
            AutomationSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            owner=request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


# ==========================================
# DETAIL
# ==========================================

class AutomationDetailView(
    APIView
):

    def get_object(
        self,
        pk,
    ):

        return Automation.objects.get(
            pk=pk
        )

    def get(
        self,
        request,
        pk,
    ):

        automation = self.get_object(
            pk
        )

        serializer = (
            AutomationSerializer(
                automation
            )
        )

        return Response(
            serializer.data
        )

    def patch(
        self,
        request,
        pk,
    ):

        automation = self.get_object(
            pk
        )

        serializer = (
            AutomationSerializer(
                automation,
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

        automation = self.get_object(
            pk
        )

        automation.delete()

        return Response(
            status=204
        )


# ==========================================
# VALIDATE
# ==========================================

class ValidateAutomationView(
    APIView
):

    def post(
        self,
        request,
        pk,
    ):

        validate_workflow(pk)

        return Response({

            "success": True,

            "message":
                "Workflow validated."

        })


# ==========================================
# EXECUTE
# ==========================================

class ExecuteAutomationView(
    APIView
):

    def post(
        self,
        request,
        pk,
    ):

        automation = (
            Automation.objects.get(
                pk=pk
            )
        )

        execution = (
            dispatch_workflow(
                automation,
                request.user,
            )
        )

        return Response({

            "success": True,

            "execution_id":
                execution.id,

        })
    

class AutomationNodeCreateView(
    APIView
):

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


