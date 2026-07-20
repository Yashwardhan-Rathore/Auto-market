import logging
from django.db import transaction
from .models import Wallet, Transaction

logger = logging.getLogger(__name__)

class InsufficientCreditsError(Exception):
    pass

class BillingService:
    @staticmethod
    @transaction.atomic
    def consume_credits(amount, description="", reference_id=None):
        """
        Deducts the specified amount of credits from the wallet.
        Raises InsufficientCreditsError if the balance is too low.
        """
        if amount <= 0:
            return

        wallet = Wallet.objects.select_for_update().first()
        if not wallet:
            # Auto-create wallet with 1000 initial credits for testing/development
            wallet = Wallet.objects.create(balance=1000)
            logger.info("Auto-created missing wallet with 1000 credits.")

        if wallet.balance < amount:
            raise InsufficientCreditsError("Not enough credits.")

        wallet.balance -= amount
        wallet.save(update_fields=["balance", "updated_at"])

        Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.Type.DEBIT,
            amount=amount,
            description=description,
            reference_id=reference_id
        )

        logger.info(f"Consumed {amount} credits. New balance: {wallet.balance}")

    @staticmethod
    @transaction.atomic
    def add_credits(amount, description="", reference_id=None):
        """
        Adds the specified amount of credits to the wallet.
        """
        if amount <= 0:
            return

        wallet = Wallet.objects.select_for_update().first()
        if not wallet:
            wallet = Wallet.objects.create(balance=0)

        wallet.balance += amount
        wallet.save(update_fields=["balance", "updated_at"])

        Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.Type.CREDIT,
            amount=amount,
            description=description,
            reference_id=reference_id
        )

        logger.info(f"Added {amount} credits. New balance: {wallet.balance}")
