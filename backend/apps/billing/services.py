import logging
from django.db import transaction
from .models import Wallet, Transaction

logger = logging.getLogger(__name__)

class InsufficientCreditsError(Exception):
    pass

class BillingService:
    @staticmethod
    @transaction.atomic
    def consume_credits(company, amount, description="", reference_id=None):
        """
        Deducts the specified amount of credits from the company's wallet.
        Raises InsufficientCreditsError if the balance is too low.
        """
        if amount <= 0:
            return

        wallet = Wallet.objects.select_for_update().get(company=company)

        if wallet.balance < amount:
            raise InsufficientCreditsError(f"Company {company.name} does not have enough credits.")

        wallet.balance -= amount
        wallet.save(update_fields=["balance", "updated_at"])

        Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.Type.DEBIT,
            amount=amount,
            description=description,
            reference_id=reference_id
        )

        logger.info(f"Consumed {amount} credits for company {company.id}. New balance: {wallet.balance}")

    @staticmethod
    @transaction.atomic
    def add_credits(company, amount, description="", reference_id=None):
        """
        Adds the specified amount of credits to the company's wallet.
        """
        if amount <= 0:
            return

        wallet, _ = Wallet.objects.select_for_update().get_or_create(company=company)

        wallet.balance += amount
        wallet.save(update_fields=["balance", "updated_at"])

        Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.Type.CREDIT,
            amount=amount,
            description=description,
            reference_id=reference_id
        )

        logger.info(f"Added {amount} credits for company {company.id}. New balance: {wallet.balance}")
