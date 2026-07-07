class BaseSMSProvider:
    def send(self, to, message, metadata=None):
        raise NotImplementedError


class TwilioProvider(BaseSMSProvider):
    def __init__(self, account_sid=None, auth_token=None, from_number=None):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_number = from_number

    def send(self, to, message, metadata=None):
        try:
            from twilio.rest import Client
        except ImportError as exc:
            raise RuntimeError(
                "twilio is required for Twilio SMS delivery."
            ) from exc

        client = Client(
            self.account_sid,
            self.auth_token,
        )
        return client.messages.create(
            body=message,
            from_=self.from_number,
            to=to,
        )


class MSG91Provider(BaseSMSProvider):
    def __init__(self, auth_key=None, sender_id=None):
        self.auth_key = auth_key
        self.sender_id = sender_id

    def send(self, to, message, metadata=None):
        try:
            import requests
            from requests.adapters import HTTPAdapter
            from urllib3.util.retry import Retry
        except ImportError as exc:
            raise RuntimeError(
                "requests is required for MSG91 SMS delivery."
            ) from exc

        session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        session.mount("https://", HTTPAdapter(max_retries=retries))

        url = "https://api.msg91.com/api/v2/sendsms"
        headers = {
            "authkey": self.auth_key,
            "Content-Type": "application/json",
        }
        payload = {
            "sender": self.sender_id,
            "route": "4",
            "country": "0",
            "sms": [
                {
                    "message": message,
                    "to": [to],
                }
            ],
        }

        try:
            response = session.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("type") == "error":
                raise RuntimeError(f"MSG91 API Error: {data.get('message')}")

            class MSG91Response:
                def __init__(self, sid):
                    self.sid = sid

            return MSG91Response(sid=data.get("message", ""))
        except requests.RequestException as exc:
            raise RuntimeError(f"MSG91 request failed: {str(exc)}") from exc


