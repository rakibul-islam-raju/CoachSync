from django.urls import path

from .views import (
    StudentListView,
    StudentDetailView,
    EnrollListCreateView,
    EnrollDetailView,
    TransactionListCreateView,
    StudentShortStatsView,
    TransactionStatsView,
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
    path(
        "enrolls/<int:pk>/transactions",
        TransactionListCreateView.as_view(),
        name="student-enroll-transaction-list",
    ),
    path("enrolls/<int:pk>", EnrollDetailView.as_view(), name="student-enroll-details"),
    path("<str:student_id>", StudentDetailView.as_view(), name="student-details"),
]
