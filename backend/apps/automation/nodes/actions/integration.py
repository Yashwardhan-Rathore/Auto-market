import json
from urllib import request


class WebhookCallAction:
    def execute(self, execution, node, config):
        url = config["url"]
        payload = json.dumps(config.get("payload", {})).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            **config.get("headers", {}),
        }

        req = request.Request(
            url,
            data=payload,
            headers=headers,
            method=config.get("method", "POST").upper(),
        )

        with request.urlopen(req, timeout=config.get("timeout", 10)) as res:
            status = res.status

        return {
            "success": True,
            "status": status,
        }


class HttpRequestAction(WebhookCallAction):
    pass


class InternalAPICallAction:
    def execute(self, execution, node, config):
        return {
            "success": True,
            "message": "Internal API call queued.",
            "config": config,
        }

