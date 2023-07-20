from django.urls import path

from .views import StudentListView, StudentDetailView

urlpatterns = [
    path("", StudentListView.as_view(), name="student-list"),
    path("<pk>", StudentDetailView.as_view(), name="student-details"),
]
