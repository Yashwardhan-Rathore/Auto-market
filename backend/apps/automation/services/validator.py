from apps.automation.models import (
    Automation,
)


class WorkflowValidationError(Exception):
    """
    Raised when workflow validation fails.
    """
    pass


class WorkflowValidator:

    def __init__(self, automation: Automation):

        self.automation = automation

        self.nodes = list(
            automation.nodes.all()
        )

        self.edges = list(
            automation.edges.all()
        )

        self.node_ids = {
            node.id
            for node in self.nodes
        }

    # =====================================================
    # PUBLIC
    # =====================================================

    def validate(self):

        self.validate_exists()

        self.validate_not_empty()

        self.validate_has_single_trigger()

        self.validate_has_end()

        self.validate_edge_integrity()

        self.validate_connected()

        self.validate_cycles()

        return True

    # =====================================================
    # BASIC
    # =====================================================

    def validate_exists(self):

        if not self.automation:
            raise WorkflowValidationError(
                "Automation not found."
            )

    def validate_not_empty(self):

        if len(self.nodes) == 0:
            raise WorkflowValidationError(
                "Workflow contains no nodes."
            )

    # =====================================================
    # TRIGGER
    # =====================================================

    def validate_has_single_trigger(self):

        triggers = [

            node

            for node in self.nodes

            if node.node_type == "TRIGGER"
        ]

        if len(triggers) == 0:

            raise WorkflowValidationError(
                "Workflow must contain a trigger."
            )

        if len(triggers) > 1:

            raise WorkflowValidationError(
                "Workflow can contain only one trigger."
            )

    # =====================================================
    # END NODE
    # =====================================================

    def validate_has_end(self):

        ends = [

            node

            for node in self.nodes

            if node.action_name.upper() == "END"
        ]

        if len(ends) == 0:

            raise WorkflowValidationError(
                "Workflow must contain an END node."
            )

    # =====================================================
    # EDGE VALIDATION
    # =====================================================

    def validate_edge_integrity(self):

        for edge in self.edges:

            if edge.source_node_id not in self.node_ids:

                raise WorkflowValidationError(
                    f"Invalid source node: "
                    f"{edge.source_node_id}"
                )

            if edge.target_node_id not in self.node_ids:

                raise WorkflowValidationError(
                    f"Invalid target node: "
                    f"{edge.target_node_id}"
                )

    # =====================================================
    # CONNECTIVITY
    # =====================================================

    def validate_connected(self):

        graph = {}

        for edge in self.edges:

            graph.setdefault(
                edge.source_node_id,
                []
            ).append(
                edge.target_node_id
            )

        trigger = next(
            node
            for node in self.nodes
            if node.node_type == "TRIGGER"
        )

        visited = set()

        def dfs(node_id):

            if node_id in visited:
                return

            visited.add(node_id)

            for nxt in graph.get(node_id, []):

                dfs(nxt)

        dfs(trigger.id)

        if len(visited) != len(self.nodes):

            disconnected = [

                str(node.id)

                for node in self.nodes

                if node.id not in visited
            ]

            raise WorkflowValidationError(
                "Disconnected nodes found: "
                + ", ".join(disconnected)
            )

    # =====================================================
    # CYCLE DETECTION
    # =====================================================

    def validate_cycles(self):

        graph = {}

        for edge in self.edges:

            graph.setdefault(
                edge.source_node_id,
                []
            ).append(
                edge.target_node_id
            )

        visited = set()

        stack = set()

        def dfs(node):

            if node in stack:
                return True

            if node in visited:
                return False

            visited.add(node)

            stack.add(node)

            for nxt in graph.get(node, []):

                if dfs(nxt):
                    return True

            stack.remove(node)

            return False

        for node in graph:

            if dfs(node):

                raise WorkflowValidationError(
                    "Circular dependency detected."
                )


# =========================================================
# HELPER FUNCTION
# =========================================================

def validate_workflow(
    automation_id
):

    automation = Automation.objects.get(
        pk=automation_id
    )

    validator = WorkflowValidator(
        automation
    )

    return validator.validate()

