class ManualTrigger:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        return {
            "success": True,
            "message": "Manual trigger fired."
        }