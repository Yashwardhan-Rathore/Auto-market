class SmsSender:

    @staticmethod
    def send(*, delivery):

        print("=" * 60)
        print("SMS")
        print("=" * 60)

        print("Phone:")
        print(delivery.customer.data.get("phone"))

        print()

        print(delivery.rendered_message)

        return {
            "success": True,
            "provider_message_id": "SMS-001",
        }