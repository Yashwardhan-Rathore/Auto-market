class EndAction:

    def execute(
        self,
        execution,
        node,
        config,
    ):
        return {
            "success": True,
            "message": "Workflow finished."
        }