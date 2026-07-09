from apps.communications.services.sms import send_sms


class SendSMSAction:
    def execute(self, execution, node, config):
        send_sms(
            organization=execution.automation.owner,
            to=config.get("to"),
            message=config.get("message", ""),
            config=config,
            execution=execution,
        )

        return {
            "success": True,
            "message": "SMS sent.",
        }

