class BaseWhatsAppProvider:
    def send(self, to, message, metadata=None):
        raise NotImplementedError


class MetaWhatsAppProvider(BaseWhatsAppProvider):
    def __init__(self, access_token=None, phone_number_id=None):
        self.access_token = access_token
        self.phone_number_id = phone_number_id

    def send(self, to, message, metadata=None):
        try:
            import requests
            from requests.adapters import HTTPAdapter
            from urllib3.util.retry import Retry
            import logging
        except ImportError as exc:
            raise RuntimeError(
                "requests is required for Meta WhatsApp delivery."
            ) from exc

        logger = logging.getLogger(__name__)
        session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        session.mount("https://", HTTPAdapter(max_retries=retries))

        url = f"https://graph.facebook.com/v17.0/{self.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        
        metadata = metadata or {}
        message_type = metadata.get("type", "text")
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": message_type,
        }
        
        if message_type == "text":
            payload["text"] = {"preview_url": False, "body": message}
        elif message_type == "template":
            payload["template"] = metadata.get("template", {})
        else:
            payload[message_type] = metadata.get(message_type, {})

        try:
            logger.info(f"Sending WhatsApp message to {to}")
            response = session.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            message_id = ""
            if "messages" in data and len(data["messages"]) > 0:
                message_id = data["messages"][0].get("id", "")
                
            class WhatsAppResponse:
                def __init__(self, msg_id):
                    self.id = msg_id
                    
            return WhatsAppResponse(msg_id=message_id)
        except requests.RequestException as exc:
            logger.error(f"WhatsApp request failed: {str(exc)}")
            raise RuntimeError(f"Meta WhatsApp request failed: {str(exc)}") from exc

