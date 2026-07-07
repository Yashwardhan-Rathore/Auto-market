class WebhookTrigger:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        return {
            "success": True,
            "message":
                "Webhook triggered",
        }