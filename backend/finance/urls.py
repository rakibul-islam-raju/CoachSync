from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CashReconciliationViewSet,
    ExpenseCategoryViewSet,
    ExpenseViewSet,
    FinanceSummaryView,
    InstallmentViewSet,
    InvoiceViewSet,
    OverdueReminderViewSet,
    PaymentMethodViewSet,
    ScholarshipAwardViewSet,
    ScholarshipViewSet,
)


router = DefaultRouter(trailing_slash=False)
router.register("payment-methods", PaymentMethodViewSet)
router.register("scholarships", ScholarshipViewSet)
router.register("scholarship-awards", ScholarshipAwardViewSet)
router.register("invoices", InvoiceViewSet)
router.register("installments", InstallmentViewSet)
router.register("expense-categories", ExpenseCategoryViewSet)
router.register("expenses", ExpenseViewSet)
router.register("reconciliations", CashReconciliationViewSet)
router.register("reminders", OverdueReminderViewSet)

urlpatterns = [path("summary", FinanceSummaryView.as_view(), name="finance-summary")]
urlpatterns += router.urls

