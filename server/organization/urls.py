from django.urls import path

from .views import (
    SubjectListCreateView,
    SubjectRetrieveUpdateDeleteView,
    TeacherListView,
    TeacherDetailView,
)

urlpatterns = [
    path("subjects", SubjectListCreateView.as_view(), name="subjects-list-create"),
    path(
        "subjects/<pk>",
        SubjectRetrieveUpdateDeleteView.as_view(),
        name="subjects-detail",
    ),
    path("teachers", TeacherListView.as_view(), name="teachers-list"),
    path("teachers/<pk>", TeacherDetailView.as_view(), name="teachers-details"),
]
