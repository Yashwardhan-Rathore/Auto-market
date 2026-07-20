from django.db.models import Q, Sum
from django.db.models.functions import Coalesce
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsSuperAdmin
from apps.billing.models import Transaction, Wallet


class BillingSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        wallet = Wallet.objects.order_by("created_at").first()
        transactions = Transaction.objects.select_related("wallet")[:50]
        totals = Transaction.objects.aggregate(
            credited=Coalesce(Sum("amount", filter=Q(transaction_type="CREDIT")), 0),
            consumed=Coalesce(Sum("amount", filter=Q(transaction_type="DEBIT")), 0),
        )
        return Response({
            "balance": wallet.balance if wallet else 0,
            "credited": totals["credited"],
            "consumed": totals["consumed"],
            "transaction_count": Transaction.objects.count(),
            "transactions": [
                {
                    "id": str(item.id),
                    "type": item.transaction_type,
                    "amount": item.amount,
                    "description": item.description,
                    "reference_id": item.reference_id,
                    "created_at": item.created_at,
                }
                for item in transactions
            ],
            "payment_methods_supported": False,
            "invoices_supported": False,
        })
