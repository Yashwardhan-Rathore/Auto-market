from apps.communications.services.sms import send_sms


class SendSMSAction:
    def execute(self, execution, node, config):
        send_sms(
            execution,
            config.get("to"),
            config.get("message", ""),
            config,
        )

        return {
            "success": True,
            "message": "SMS sent.",
        }

