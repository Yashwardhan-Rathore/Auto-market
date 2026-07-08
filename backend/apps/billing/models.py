from django.db import models
from apps.common.models import TimeStampedUUIDModel


class Wallet(TimeStampedUUIDModel):
    company = models.OneToOneField(
        "common.Company",
        on_delete=models.CASCADE,
        related_name="wallet"
    )
    balance = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "wallets"

    def __str__(self):
        return f"{self.company.name} Wallet - Balance: {self.balance}"


class Transaction(TimeStampedUUIDModel):
    class Type(models.TextChoices):
        CREDIT = "CREDIT", "Credit"
        DEBIT = "DEBIT", "Debit"

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name="transactions"
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=Type.choices,
        db_index=True
    )
    amount = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    reference_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
        help_text="ID of the related entity (e.g. GeneratedContent ID or Payment ID)"
    )

    class Meta:
        db_table = "billing_transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} {self.amount} - {self.wallet.company.name}"
