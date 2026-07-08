class BasePushProvider:
    def send(self, recipient, title, body, metadata=None):
        raise NotImplementedError

    def validate_configuration(self):
        return True

    def health_check(self):
        return True

    def test_connection(self):
        return True


class BrowserPushProvider(BasePushProvider):
    def send(self, recipient, title, body, metadata=None):
        raise RuntimeError(
            "Browser push delivery requires web push credentials."
        )


class MobilePushProvider(BasePushProvider):
    def send(self, recipient, title, body, metadata=None):
        raise RuntimeError(
            "Mobile push delivery requires an FCM/APNS provider."
        )

