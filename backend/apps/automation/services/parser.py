# apps/automation/services/parser.py

from apps.automation.models import (
    Automation,
)


class WorkflowParser:

    def __init__(self, automation):

        self.automation = automation

        self.nodes = {
            node.id: node
            for node in automation.nodes.all()
        }

        self.edges = automation.edges.all()

    # =====================================================
    # BUILD GRAPH
    # =====================================================

    def build_graph(self):

        graph = {}

        for node_id in self.nodes:
            graph[node_id] = []

        for edge in self.edges:

            graph[edge.source_node_id].append({
                "target": edge.target_node_id,
                "type": edge.edge_type,
            })

        return graph

    # =====================================================
    # GET TRIGGER
    # =====================================================

    def get_trigger_node(self):

        for node in self.nodes.values():

            if node.node_type == "TRIGGER":
                return node

        return None

    # =====================================================
    # PARSE
    # =====================================================

    def parse(self):

        return {
            "nodes": self.nodes,
            "graph": self.build_graph(),
            "trigger": self.get_trigger_node(),
        }


# =====================================================
# HELPER
# =====================================================

def parse_workflow(automation_id):

    automation = Automation.objects.get(
        pk=automation_id
    )

    parser = WorkflowParser(
        automation
    )

    return parser.parse()