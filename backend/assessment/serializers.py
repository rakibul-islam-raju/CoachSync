from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from organization.models import Exam
from organization.tenancy import resolve_request_organization
from student.models import Student

from .models import (
    ExamCandidate,
    ExamMark,
    GradeBand,
    GradeScale,
    Outcome,
    OutcomeLine,
    ResultPublication,
)


class GradeBandSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeBand
        fields = [
            "id",
            "minimum_percentage",
            "maximum_percentage",
            "grade",
            "grade_point",
        ]
        read_only_fields = ["id"]


class GradeScaleSerializer(serializers.ModelSerializer):
    bands = GradeBandSerializer(many=True)

    class Meta:
        model = GradeScale
        fields = [
            "id",
            "organization",
            "name",
            "is_default",
            "is_active",
            "bands",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_bands(self, bands):
        if not bands:
            raise serializers.ValidationError("Add at least one grade band.")
        ordered = sorted(bands, key=lambda item: item["minimum_percentage"])
        previous_max = None
        grades = set()
        for band in ordered:
            minimum = band["minimum_percentage"]
            maximum = band["maximum_percentage"]
            if minimum > maximum:
                raise serializers.ValidationError(
                    "A band minimum cannot exceed its maximum."
                )
            normalized_grade = band["grade"].strip().lower()
            if normalized_grade in grades:
                raise serializers.ValidationError("Grade labels must be unique.")
            grades.add(normalized_grade)
            if previous_max is not None and minimum <= previous_max:
                raise serializers.ValidationError("Grade bands cannot overlap.")
            previous_max = maximum
        return bands

    def validate(self, attrs):
        request = self.context["request"]
        organization = resolve_request_organization(
            request, data=self.initial_data, write=True
        )
        attrs["organization"] = organization
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        bands = validated_data.pop("bands")
        if validated_data.get("is_default"):
            GradeScale.objects.filter(
                organization=validated_data["organization"], is_default=True
            ).update(is_default=False)
        scale = GradeScale.objects.create(**validated_data)
        GradeBand.objects.bulk_create(
            [GradeBand(scale=scale, **band) for band in bands]
        )
        return scale

    @transaction.atomic
    def update(self, instance, validated_data):
        bands = validated_data.pop("bands", None)
        if validated_data.get("is_default"):
            GradeScale.objects.filter(
                organization=instance.organization, is_default=True
            ).exclude(pk=instance.pk).update(is_default=False)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        if bands is not None:
            instance.bands.all().delete()
            GradeBand.objects.bulk_create(
                [GradeBand(scale=instance, **band) for band in bands]
            )
        return instance


class CandidateStudentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = Student
        fields = ["id", "student_id", "first_name", "last_name"]


class ExamCandidateSerializer(serializers.ModelSerializer):
    student = CandidateStudentSerializer(read_only=True)

    class Meta:
        model = ExamCandidate
        fields = ["id", "exam_type", "student", "is_eligible"]


class ExamMarkSerializer(serializers.ModelSerializer):
    candidate = ExamCandidateSerializer(read_only=True)

    class Meta:
        model = ExamMark
        fields = [
            "id",
            "exam",
            "candidate",
            "attendance_status",
            "obtained_mark",
            "remark",
            "workflow_status",
            "entered_by",
            "verified_by",
            "verified_at",
            "updated_at",
        ]


class ExamMarkInputSerializer(serializers.Serializer):
    candidate = serializers.IntegerField(min_value=1)
    attendance_status = serializers.ChoiceField(choices=ExamMark.ATTENDANCE_CHOICES)
    obtained_mark = serializers.DecimalField(
        max_digits=8, decimal_places=2, min_value=Decimal("0.00"), allow_null=True
    )
    remark = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate(self, attrs):
        exam: Exam = self.context["exam"]
        status = attrs["attendance_status"]
        mark = attrs.get("obtained_mark")
        if status == ExamMark.PRESENT and mark is None:
            raise serializers.ValidationError(
                {"obtained_mark": "A present student requires a mark."}
            )
        if status != ExamMark.PRESENT and mark is not None:
            raise serializers.ValidationError(
                {"obtained_mark": "Absent or exempt students cannot have a mark."}
            )
        if mark is not None and mark > exam.total_mark:
            raise serializers.ValidationError(
                {"obtained_mark": f"Mark cannot exceed {exam.total_mark}."}
            )
        return attrs


class OutcomeLineSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="exam.subject.name", read_only=True)
    subject_code = serializers.CharField(source="exam.subject.code", read_only=True)
    exam_name = serializers.CharField(source="exam.name", read_only=True)

    class Meta:
        model = OutcomeLine
        fields = [
            "id",
            "exam",
            "exam_name",
            "subject",
            "subject_code",
            "attendance_status",
            "obtained_mark",
            "total_mark",
            "pass_mark",
            "percentage",
            "grade",
            "grade_point",
            "has_passed",
        ]


class PublicationSerializer(serializers.ModelSerializer):
    exam_type_name = serializers.CharField(source="exam_type.name", read_only=True)
    batch_name = serializers.CharField(source="exam_type.batch.name", read_only=True)

    class Meta:
        model = ResultPublication
        fields = [
            "id",
            "exam_type",
            "exam_type_name",
            "batch_name",
            "version",
            "status",
            "message",
            "show_rank",
            "published_at",
            "published_by",
        ]


class OutcomeSerializer(serializers.ModelSerializer):
    student = CandidateStudentSerializer(read_only=True)
    publication = PublicationSerializer(read_only=True)
    lines = OutcomeLineSerializer(many=True, read_only=True)
    rank = serializers.SerializerMethodField()

    def get_rank(self, outcome) -> int | None:
        request = self.context.get("request")
        if outcome.publication.show_rank:
            return outcome.rank
        if request and request.user.role in {
            "admin",
            "admin_staff",
            "org_admin",
            "org_staff",
        }:
            return outcome.rank
        return None

    class Meta:
        model = Outcome
        fields = [
            "id",
            "publication",
            "student",
            "total_obtained",
            "total_possible",
            "percentage",
            "grade",
            "grade_point",
            "has_passed",
            "rank",
            "lines",
            "created_at",
        ]


class PublishSerializer(serializers.Serializer):
    grade_scale = serializers.PrimaryKeyRelatedField(
        queryset=GradeScale.objects.filter(is_active=True)
    )
    message = serializers.CharField(max_length=255, required=False, allow_blank=True)
    show_rank = serializers.BooleanField(default=False)

    def validate_grade_scale(self, scale):
        organization = self.context["organization"]
        if scale.organization_id != organization.id:
            raise serializers.ValidationError(
                "The grade scale belongs to another organization."
            )
        return scale


class CountSerializer(serializers.Serializer):
    submitted = serializers.IntegerField(required=False)
    verified = serializers.IntegerField(required=False)


class ReviewExamSerializer(serializers.Serializer):
    exam = serializers.IntegerField()
    name = serializers.CharField()
    subject = serializers.CharField()
    entered = serializers.IntegerField()
    verified = serializers.IntegerField()
    expected = serializers.IntegerField()


class AssessmentReviewSerializer(serializers.Serializer):
    exam_type = serializers.IntegerField()
    exam_type_name = serializers.CharField()
    candidate_count = serializers.IntegerField()
    exam_count = serializers.IntegerField()
    expected_marks = serializers.IntegerField()
    entered_marks = serializers.IntegerField()
    draft_marks = serializers.IntegerField()
    submitted_marks = serializers.IntegerField()
    verified_marks = serializers.IntegerField()
    missing_marks = serializers.IntegerField()
    ready_to_publish = serializers.BooleanField()
    exams = ReviewExamSerializer(many=True)


class DetailSerializer(serializers.Serializer):
    detail = serializers.CharField()


class ChildSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    student_id = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    relationship = serializers.CharField()
