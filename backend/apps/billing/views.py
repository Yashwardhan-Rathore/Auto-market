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
        from django.utils.dateparse import parse_date

        wallet = Wallet.objects.order_by("created_at").first()

        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        transactions_qs = Transaction.objects.select_related("wallet")
        totals_qs = Transaction.objects

        if date_from:
            parsed = parse_date(date_from)
            if parsed:
                transactions_qs = transactions_qs.filter(created_at__date__gte=parsed)
                totals_qs = totals_qs.filter(created_at__date__gte=parsed)
        if date_to:
            parsed = parse_date(date_to)
            if parsed:
                transactions_qs = transactions_qs.filter(created_at__date__lte=parsed)
                totals_qs = totals_qs.filter(created_at__date__lte=parsed)

        transactions = transactions_qs[:50]
        totals = totals_qs.aggregate(
            credited=Coalesce(Sum("amount", filter=Q(transaction_type="CREDIT")), 0),
            consumed=Coalesce(Sum("amount", filter=Q(transaction_type="DEBIT")), 0),
        )

        return Response({
            "balance": wallet.balance if wallet else 0,
            "credited": totals["credited"],
            "consumed": totals["consumed"],
            "transaction_count": totals_qs.count(),
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
