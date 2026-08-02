from django.urls import path

from .views import (
    StudentListView,
    StudentDetailView,
    EnrollListCreateView,
    EnrollDetailView,
    TransactionListCreateView,
    TransactionReversalView,
    EnrollmentCancellationView,
    EnrollmentExportView,
    StudentShortStatsView,
    TransactionStatsView,
    StudentGuardianListCreateView,
    StudentGuardianDetailView,
)

urlpatterns = [
    path("", StudentListView.as_view(), name="student-list"),
    path(
        "statistics/transactions",
        TransactionStatsView.as_view(),
        name="student-transaction-stats",
    ),
    path("statistics", StudentShortStatsView.as_view(), name="student-stats"),
    path("enrolls", EnrollListCreateView.as_view(), name="student-enroll-list"),
    path("enrolls/export", EnrollmentExportView.as_view(), name="student-enroll-export"),
    path(
        "enrolls/<int:pk>/transactions",
        TransactionListCreateView.as_view(),
        name="student-enroll-transaction-list",
    ),
    path(
        "enrolls/<int:pk>/transactions/<int:transaction_pk>/reverse",
        TransactionReversalView.as_view(),
        name="student-enroll-transaction-reverse",
    ),
    path(
        "enrolls/<int:pk>/cancel",
        EnrollmentCancellationView.as_view(),
        name="student-enroll-cancel",
    ),
    path("enrolls/<int:pk>", EnrollDetailView.as_view(), name="student-enroll-details"),
    path(
        "<str:student_id>/guardians",
        StudentGuardianListCreateView.as_view(),
        name="student-guardian-list",
    ),
    path(
        "guardians/<int:pk>",
        StudentGuardianDetailView.as_view(),
        name="student-guardian-detail",
    ),
    path("<str:student_id>", StudentDetailView.as_view(), name="student-details"),
]
