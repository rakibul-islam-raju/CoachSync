from django.urls import path

from .views import (
    CandidateGenerateView,
    CandidateListView,
    ChildOutcomeListView,
    ExamMarkSheetView,
    ExamMarkSubmitView,
    ExamMarkVerifyView,
    ExamTypeOutcomeListView,
    ExamTypeReviewView,
    GradeScaleDetailView,
    GradeScaleListCreateView,
    MyChildrenView,
    MyOutcomeListView,
    PublishResultsView,
    ReopenPublicationView,
)

urlpatterns = [
    path("grade-scales", GradeScaleListCreateView.as_view(), name="grade-scales"),
    path(
        "grade-scales/<int:pk>",
        GradeScaleDetailView.as_view(),
        name="grade-scale-detail",
    ),
    path(
        "exam-types/<int:exam_type_pk>/candidates/generate",
        CandidateGenerateView.as_view(),
        name="candidate-generate",
    ),
    path(
        "exam-types/<int:exam_type_pk>/candidates",
        CandidateListView.as_view(),
        name="candidate-list",
    ),
    path(
        "exams/<int:exam_pk>/marks",
        ExamMarkSheetView.as_view(),
        name="exam-mark-sheet",
    ),
    path(
        "exams/<int:exam_pk>/marks/submit",
        ExamMarkSubmitView.as_view(),
        name="exam-mark-submit",
    ),
    path(
        "exams/<int:exam_pk>/marks/verify",
        ExamMarkVerifyView.as_view(),
        name="exam-mark-verify",
    ),
    path(
        "exam-types/<int:exam_type_pk>/review",
        ExamTypeReviewView.as_view(),
        name="exam-type-review",
    ),
    path(
        "exam-types/<int:exam_type_pk>/publish",
        PublishResultsView.as_view(),
        name="publish-results",
    ),
    path(
        "publications/<int:publication_pk>/reopen",
        ReopenPublicationView.as_view(),
        name="reopen-publication",
    ),
    path(
        "exam-types/<int:exam_type_pk>/outcomes",
        ExamTypeOutcomeListView.as_view(),
        name="exam-type-outcomes",
    ),
    path("my-outcomes", MyOutcomeListView.as_view(), name="my-outcomes"),
    path("my-children", MyChildrenView.as_view(), name="my-children"),
    path(
        "my-children/<int:student_pk>/outcomes",
        ChildOutcomeListView.as_view(),
        name="child-outcomes",
    ),
]
