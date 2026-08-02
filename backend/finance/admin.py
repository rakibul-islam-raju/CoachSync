from django.contrib import admin

from .models import (
    CashReconciliation,
    Expense,
    ExpenseCategory,
    Installment,
    Invoice,
    OverdueReminder,
    PaymentMethod,
    Scholarship,
    ScholarshipAward,
)


admin.site.register(
    [
        PaymentMethod,
        Scholarship,
        ScholarshipAward,
        Invoice,
        Installment,
        ExpenseCategory,
        Expense,
        CashReconciliation,
        OverdueReminder,
    ]
)

