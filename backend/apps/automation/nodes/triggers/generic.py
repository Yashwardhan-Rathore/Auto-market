class GenericEventTrigger:
    def execute(self, execution, node, config):
        return {
            "success": True,
            "message": f"{node.action_name} trigger fired.",
            "context": execution.context,
        }
