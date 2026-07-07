class WhatsAppSender:

    @staticmethod
    def send(*, delivery):

        print("=" * 60)
        print("WHATSAPP")
        print("=" * 60)

        print("Phone:")
        print(delivery.customer.data.get("phone"))

        print()

        print(delivery.rendered_message)

        return {
            "success": True,
            "provider_message_id": "WA-001",
        }