from django.db import models
from django.db.models.functions import Lower

from user.models import User
from utilities.models import BaseModel


LEGACY_ORGANIZATION_SLUG = "legacy"


class Organization(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

    objects = models.Manager()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


def get_legacy_organization_pk():
    organization, _ = Organization.objects.get_or_create(
        slug=LEGACY_ORGANIZATION_SLUG,
        defaults={"name": "Legacy Organization"},
    )
    return organization.pk


class OrganizationMembership(BaseModel):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="organization_memberships"
    )
    is_default = models.BooleanField(default=False)

    objects = models.Manager()

    class Meta:
        ordering = ["organization__name", "user__email"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "user"],
                name="unique_organization_membership",
            )
        ]

    def __str__(self):
        return f"{self.user.email} @ {self.organization.name}"


class TenantModel(BaseModel):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="%(class)s_set",
        default=get_legacy_organization_pk,
    )

    class Meta:
        abstract = True


class Subject(TenantModel):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=16)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(
                Lower("code"), "organization", name="unique_subject_code_per_org_ci"
            )
        ]

    def __str__(self):
        return self.name


class Teacher(TenantModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teachers")

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.user.email


class Classs(TenantModel):
    name = models.CharField(max_length=20)
    numeric = models.IntegerField()

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "organization", name="unique_class_name_per_org_ci"
            ),
            models.UniqueConstraint(
                fields=["organization", "numeric"],
                name="unique_class_numeric_per_org",
            ),
            models.CheckConstraint(
                condition=models.Q(numeric__gt=0), name="class_numeric_positive"
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.numeric}"


class Batch(TenantModel):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=6, blank=True, null=True)
    classs = models.ForeignKey(Classs, on_delete=models.CASCADE)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    fee = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(
                Lower("code"),
                "organization",
                condition=models.Q(code__isnull=False),
                name="unique_batch_code_per_org_ci",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(start_date__isnull=True)
                    | models.Q(end_date__isnull=True)
                    | models.Q(start_date__lte=models.F("end_date"))
                ),
                name="batch_dates_ordered",
            ),
            models.CheckConstraint(
                condition=models.Q(fee__isnull=True) | models.Q(fee__gt=0),
                name="batch_fee_positive",
            ),
        ]

    def __str__(self):
        return self.name

    def class_name(self):
        return self.classs.name


class ExamType(TenantModel):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(start_date__lte=models.F("end_date")),
                name="exam_type_dates_ordered",
            ),
            models.UniqueConstraint(
                Lower("name"),
                "organization",
                "batch",
                name="unique_exam_type_per_batch_ci",
            ),
        ]

    def __str__(self):
        return self.name


class Exam(TenantModel):
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField()
    pass_mark = models.PositiveBigIntegerField()
    total_mark = models.PositiveBigIntegerField()
    is_required = models.BooleanField(default=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(pass_mark__gt=0), name="exam_pass_mark_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(total_mark__gt=0), name="exam_total_mark_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(pass_mark__lte=models.F("total_mark")),
                name="exam_pass_mark_not_above_total",
            ),
            models.UniqueConstraint(
                fields=["organization", "exam_type", "subject"],
                name="unique_exam_subject_per_type",
            ),
        ]

    def __str__(self):
        return self.name


class Schedule(TenantModel):
    title = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, blank=True, null=True
    )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    duration = models.PositiveIntegerField()
    date = models.DateField()
    time = models.TimeField()
    exam = models.ForeignKey(Exam, models.SET_NULL, blank=True, null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["date", "time"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(duration__gt=0), name="schedule_duration_positive"
            )
        ]

    def __str__(self):
        return self.title
