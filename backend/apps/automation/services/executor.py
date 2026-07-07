from apps.automation.services.parser import (
    parse_workflow,
)

from apps.automation.nodes.conditions import (
    CONDITION_REGISTRY
)

from apps.automation.services.logger import (
    log_execution,
)

from apps.automation.nodes.actions import (
    ACTION_REGISTRY,
)

from apps.automation.nodes.triggers import (
    TRIGGER_REGISTRY,
)

from apps.automation.nodes.utilities import (
    UTILITY_REGISTRY,
)


class WorkflowExecutor:

    def __init__(
        self,
        execution,
        start_node=None,
    ):

        self.execution = execution

        parsed = parse_workflow(
            execution.automation.id
        )

        self.nodes = parsed["nodes"]

        self.graph = parsed["graph"]

        self.current = (
            start_node
            or execution.current_node
            or parsed["trigger"]
        )

    # =====================================================
    # EXECUTE NODE
    # =====================================================

    def execute_node(
        self,
        node,
    ):

        if node.node_type == "TRIGGER":

            handler = (
                TRIGGER_REGISTRY[
                node.action_name
                ]
            )

        elif node.node_type == "CONDITION":

            handler = (
                CONDITION_REGISTRY[
                    node.action_name
                ]
            )

        elif node.node_type == "ACTION":

            handler = (
                ACTION_REGISTRY[
                    node.action_name
                ]
            )

        else:

            handler = (
                UTILITY_REGISTRY[
                    node.action_name
                ]
            )

        return handler.execute(
            self.execution,
            node,
            node.business_config,
        )

    # =====================================================
    # GET NEXT NODE
    # =====================================================

    def get_next(
        self,
        node,
        result=None,
    ):

        edges = self.graph.get(
            node.id,
            []
        )

        if not edges:
            return None

        if isinstance(
            result,
            bool,
        ):

            label = (
                "YES"
                if result
                else "NO"
            )

            for edge in edges:

                if (
                    edge["type"]
                    == label
                ):

                    return self.nodes[
                        edge["target"]
                    ]

        return self.nodes[
            edges[0]["target"]
        ]

    # =====================================================
    # RUN WORKFLOW
    # =====================================================

    def run(self):

        current = self.current

        while current:

            self.execution.current_node = current

            self.execution.save(
                update_fields=[
                    "current_node"
                ]
            )

            try:

                log_execution(
                    execution=self.execution,
                    node=current,
                    status="STARTED",
                    message="Node execution started.",
                )

                result = self.execute_node(
                    current
                )

                log_execution(
                    execution=self.execution,
                    node=current,
                    status="SUCCESS",
                    message=str(result),
                )

            except Exception as e:

                log_execution(
                    execution=self.execution,
                    node=current,
                    status="FAILED",
                    message=str(e),
                )

                raise

            if self.execution.status == "WAITING":

                return False

            if current.action_name == "END":

                break

            current = self.get_next(
                current,
                result,
            )

        return True
