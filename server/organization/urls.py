from django.urls import path

from .views import (
    SubjectListCreateView,
    SubjectDetailView,
    TeacherListCreateView,
    TeacherDetailView,
    ClasssListCreateView,
    ClasssDetailView,
    BatchListCreateView,
    BatchDetailView,
    ExamTypeListCreateView,
    ExamTypeDetailView,
    ExamListCreateView,
    ExamDetailView,
    ScheduleListCreateView,
    ScheduleDetailView,
    OrganizationShortInfoView,
)

urlpatterns = [
    path("subjects", SubjectListCreateView.as_view(), name="subjects-list-create"),
    path(
        "subjects/<pk>",
        SubjectDetailView.as_view(),
        name="subjects-detail",
    ),
    path("teachers", TeacherListCreateView.as_view(), name="teachers-list"),
    path("teachers/<pk>", TeacherDetailView.as_view(), name="teachers-details"),
    path("classes", ClasssListCreateView.as_view(), name="class-list"),
    path("classes/<pk>", ClasssDetailView.as_view(), name="class-details"),
    path("batches", BatchListCreateView.as_view(), name="batch-list"),
    path("batches/<pk>", BatchDetailView.as_view(), name="batch-details"),
    path("exam-types", ExamTypeListCreateView.as_view(), name="exam-types-list"),
    path("exam-types/<pk>", ExamTypeDetailView.as_view(), name="exam-types-details"),
    path("exams", ExamListCreateView.as_view(), name="exam-list"),
    path("exams/<pk>", ExamDetailView.as_view(), name="exam-details"),
    path("schedules", ScheduleListCreateView.as_view(), name="schedule-list"),
    path("schedules/<pk>", ScheduleDetailView.as_view(), name="schedule-details"),
    path("statistics", OrganizationShortInfoView.as_view(), name="org-stats"),
]
