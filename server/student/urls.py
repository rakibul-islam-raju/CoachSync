from django.urls import path

from .views import (
    StudentListView,
    StudentDetailView,
    EnrollListCreateView,
    EnrollDetailView,
)

urlpatterns = [
    path("", StudentListView.as_view(), name="student-list"),
    path("enrolls", EnrollListCreateView.as_view(), name="student-enroll-list"),
    path("enrolls/<int:pk>", EnrollDetailView.as_view(), name="student-enroll-details"),
    path("<str:student_id>", StudentDetailView.as_view(), name="student-details"),
]
