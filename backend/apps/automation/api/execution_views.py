from rest_framework.response import Response
from rest_framework.views import APIView

from apps.automation.models import (
    AutomationExecution,
    AutomationExecutionLog,
)


class ExecutionHistoryView(APIView):

    def get(
        self,
        request,
        pk,
    ):

        executions = (

            AutomationExecution

            .objects

            .filter(
                automation_id=pk
            )

            .order_by(
                "-started_at"
            )

        )

        data = []

        for execution in executions:

            data.append({

                "id":
                    execution.id,

                "status":
                    execution.status,

                "started_at":
                    execution.started_at,

                "finished_at":
                    execution.finished_at,

                "retry_count":
                    execution.retry_count,

                "error_message":
                    execution.error_message,

            })

        return Response(
            data
        )


class ExecutionLogsView(APIView):

    def get(
        self,
        request,
        pk,
    ):

        logs = (

            AutomationExecutionLog

            .objects

            .filter(
                execution_id=pk
            )

            .order_by(
                "started_at"
            )

        )

        data = []

        for log in logs:

            data.append({

                "node_id":
                    log.node.id,

                "node_name":
                    log.node.label,

                "status":
                    log.status,

                "message":
                    log.message,

                "started_at":
                    log.started_at,

                "finished_at":
                    log.finished_at,

            })

        return Response(
            data
        )