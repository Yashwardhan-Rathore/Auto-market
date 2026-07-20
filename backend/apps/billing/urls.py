from django.urls import path
from apps.billing.views import BillingSummaryView

urlpatterns = [
    path("summary/", BillingSummaryView.as_view(), name="billing-summary"),
]
