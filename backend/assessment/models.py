from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from organization.models import Exam, ExamType, TenantModel
from student.models import Enroll, Student
from user.models import User


class GradeScale(TenantModel):
    name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    objects = models.Manager()

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"], name="unique_grade_scale_per_org"
            )
        ]

    def __str__(self):
        return self.name


class GradeBand(models.Model):
    scale = models.ForeignKey(
        GradeScale, on_delete=models.CASCADE, related_name="bands"
    )
    minimum_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    maximum_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    grade = models.CharField(max_length=10)
    grade_point = models.DecimalField(max_digits=4, decimal_places=2)

    objects = models.Manager()

    class Meta:
        ordering = ["-minimum_percentage"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(minimum_percentage__lte=models.F("maximum_percentage")),
                name="grade_band_percentage_ordered",
            ),
            models.UniqueConstraint(
                fields=["scale", "grade"], name="unique_grade_per_scale"
            ),
        ]

    def __str__(self):
        return f"{self.grade} ({self.minimum_percentage}-{self.maximum_percentage})"


class ExamCandidate(TenantModel):
    exam_type = models.ForeignKey(
        ExamType, on_delete=models.PROTECT, related_name="candidates"
    )
    student = models.ForeignKey(
        Student, on_delete=models.PROTECT, related_name="exam_candidates"
    )
    enrollment = models.ForeignKey(
        Enroll,
        on_delete=models.PROTECT,
        related_name="exam_candidates",
        blank=True,
        null=True,
    )
    is_eligible = models.BooleanField(default=True)

    objects = models.Manager()

    class Meta:
        ordering = ["student__student_id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "exam_type", "student"],
                name="unique_candidate_per_exam_type",
            )
        ]

    def __str__(self):
        return f"{self.exam_type} — {self.student}"


class ExamMark(TenantModel):
    PRESENT = "present"
    ABSENT = "absent"
    EXEMPT = "exempt"
    ATTENDANCE_CHOICES = (
        (PRESENT, "Present"),
        (ABSENT, "Absent"),
        (EXEMPT, "Exempt"),
    )
    DRAFT = "draft"
    SUBMITTED = "submitted"
    VERIFIED = "verified"
    WORKFLOW_CHOICES = (
        (DRAFT, "Draft"),
        (SUBMITTED, "Submitted"),
        (VERIFIED, "Verified"),
    )

    exam = models.ForeignKey(Exam, on_delete=models.PROTECT, related_name="marks")
    candidate = models.ForeignKey(
        ExamCandidate, on_delete=models.PROTECT, related_name="marks"
    )
    attendance_status = models.CharField(
        max_length=8, choices=ATTENDANCE_CHOICES, default=PRESENT
    )
    obtained_mark = models.DecimalField(
        max_digits=8, decimal_places=2, blank=True, null=True
    )
    remark = models.CharField(max_length=255, blank=True)
    workflow_status = models.CharField(
        max_length=10, choices=WORKFLOW_CHOICES, default=DRAFT
    )
    entered_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="entered_exam_marks",
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="verified_exam_marks",
    )
    verified_at = models.DateTimeField(blank=True, null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["candidate__student__student_id"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "exam", "candidate"],
                name="unique_mark_per_exam_candidate",
            ),
            models.CheckConstraint(
                condition=models.Q(obtained_mark__isnull=True)
                | models.Q(obtained_mark__gte=0),
                name="exam_mark_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(attendance_status="present")
                | models.Q(obtained_mark__isnull=True),
                name="non_present_mark_is_empty",
            ),
        ]

    def __str__(self):
        return f"{self.exam} — {self.candidate.student}"


class ResultPublication(TenantModel):
    PUBLISHED = "published"
    SUPERSEDED = "superseded"
    STATUS_CHOICES = ((PUBLISHED, "Published"), (SUPERSEDED, "Superseded"))

    exam_type = models.ForeignKey(
        ExamType, on_delete=models.PROTECT, related_name="result_publications"
    )
    grade_scale = models.ForeignKey(
        GradeScale, on_delete=models.PROTECT, related_name="publications"
    )
    version = models.PositiveIntegerField()
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default=PUBLISHED
    )
    message = models.CharField(max_length=255, blank=True)
    show_rank = models.BooleanField(default=False)
    published_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="published_results"
    )
    published_at = models.DateTimeField()

    objects = models.Manager()

    class Meta:
        ordering = ["-published_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "exam_type", "version"],
                name="unique_publication_version",
            ),
            models.UniqueConstraint(
                fields=["organization", "exam_type"],
                condition=models.Q(status="published"),
                name="one_current_publication_per_exam_type",
            ),
        ]

    def __str__(self):
        return f"{self.exam_type} v{self.version}"


class Outcome(TenantModel):
    publication = models.ForeignKey(
        ResultPublication, on_delete=models.PROTECT, related_name="outcomes"
    )
    student = models.ForeignKey(
        Student, on_delete=models.PROTECT, related_name="outcomes"
    )
    total_obtained = models.DecimalField(max_digits=10, decimal_places=2)
    total_possible = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=10)
    grade_point = models.DecimalField(max_digits=4, decimal_places=2)
    has_passed = models.BooleanField()
    rank = models.PositiveIntegerField(blank=True, null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["rank", "student__student_id"]
        constraints = [
            models.UniqueConstraint(
                fields=["publication", "student"],
                name="unique_outcome_per_publication_student",
            )
        ]

    def __str__(self):
        return f"{self.student} — {self.publication}"


class OutcomeLine(models.Model):
    outcome = models.ForeignKey(
        Outcome, on_delete=models.CASCADE, related_name="lines"
    )
    exam = models.ForeignKey(Exam, on_delete=models.PROTECT)
    attendance_status = models.CharField(
        max_length=8, choices=ExamMark.ATTENDANCE_CHOICES
    )
    obtained_mark = models.DecimalField(
        max_digits=8, decimal_places=2, blank=True, null=True
    )
    total_mark = models.DecimalField(max_digits=8, decimal_places=2)
    pass_mark = models.DecimalField(max_digits=8, decimal_places=2)
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True
    )
    grade = models.CharField(max_length=10, blank=True)
    grade_point = models.DecimalField(
        max_digits=4, decimal_places=2, blank=True, null=True
    )
    has_passed = models.BooleanField()

    objects = models.Manager()

    class Meta:
        ordering = ["exam__date", "exam__subject__name"]
        constraints = [
            models.UniqueConstraint(
                fields=["outcome", "exam"], name="unique_outcome_line_per_exam"
            )
        ]


class ResultDelivery(models.Model):
    EMAIL = "email"
    PORTAL = "portal"
    CHANNEL_CHOICES = ((EMAIL, "Email"), (PORTAL, "Portal"))
    QUEUED = "queued"
    SENT = "sent"
    FAILED = "failed"
    STATUS_CHOICES = ((QUEUED, "Queued"), (SENT, "Sent"), (FAILED, "Failed"))

    outcome = models.ForeignKey(
        Outcome, on_delete=models.CASCADE, related_name="deliveries"
    )
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="result_deliveries"
    )
    channel = models.CharField(max_length=8, choices=CHANNEL_CHOICES)
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default=QUEUED)
    attempts = models.PositiveIntegerField(default=0)
    sent_at = models.DateTimeField(blank=True, null=True)
    failure_message = models.TextField(blank=True)

    objects = models.Manager()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["outcome", "recipient", "channel"],
                name="unique_result_delivery",
            )
        ]
