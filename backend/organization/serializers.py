import secrets

from django.conf import settings
from django.db import transaction
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import serializers

from user.models import TEACHER, User
from user.serializers import ExtendedUserSerializer, UserSerializer
from utilities.tasks import send_email

from .models import (
    Batch,
    Classs,
    Exam,
    ExamType,
    Organization,
    OrganizationMembership,
    Schedule,
    Subject,
    Teacher,
)
from .tenancy import resolve_request_organization, validate_same_organization


def _organization_for_serializer(serializer, attrs):
    request = serializer.context.get("request")
    if not request:
        return attrs.get("organization") or getattr(
            serializer.instance, "organization", None
        )
    data = serializer.initial_data if isinstance(serializer.initial_data, dict) else attrs
    organization = resolve_request_organization(request, data=data, write=True)
    supplied = attrs.get("organization")
    if supplied and supplied != organization:
        raise serializers.ValidationError(
            {"organization": "You cannot write to another organization."}
        )
    return organization


def _queue_registration_email(user, kind):
    token = secrets.token_urlsafe(64)
    user.password_reset_token = token
    user.save(update_fields=["password_reset_token"])
    reset_url = f"{settings.FRONTEND_BASE_URL}/set-password/{token}"
    html_content = render_to_string(
        "set_password_email.html", {"user": user, "reset_url": reset_url}
    )
    plain_message = strip_tags(html_content)
    transaction.on_commit(
        lambda: send_email.delay(
            subject=f"Set up your {kind.lower()} account",
            to_email=[user.email],
            html_content=html_content,
            plain_message=plain_message,
        )
    )


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"
        read_only_fields = ["created_by"]

    def validate(self, attrs):
        _organization_for_serializer(self, attrs)
        return attrs


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Teacher
        fields = [
            "id",
            "organization",
            "user",
            "created_at",
            "updated_at",
            "is_active",
            "created_by",
        ]


class TeacherCreateSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer()

    class Meta:
        model = Teacher
        fields = ["id", "organization", "user", "is_active", "created_by"]
        read_only_fields = ["id", "created_by"]

    def validate(self, attrs):
        _organization_for_serializer(self, attrs)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop("user")
        organization = validated_data.pop("organization", None) or _organization_for_serializer(
            self, validated_data
        )
        user = User.objects.create(role=TEACHER, **user_data)
        teacher = Teacher.objects.create(
            user=user, organization=organization, **validated_data
        )
        OrganizationMembership.objects.update_or_create(
            organization=organization,
            user=user,
            defaults={"is_default": True, "created_by": validated_data.get("created_by")},
        )
        _queue_registration_email(user, "Teacher")
        return teacher

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        validated_data.pop("organization", None)
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ClasssSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classs
        fields = "__all__"
        read_only_fields = ["created_by"]

    def validate(self, attrs):
        _organization_for_serializer(self, attrs)
        return attrs


class BatchSerializer(serializers.ModelSerializer):
    classs = ClasssSerializer(read_only=True)

    class Meta:
        model = Batch
        fields = "__all__"


class BatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = [
            "id",
            "organization",
            "name",
            "code",
            "classs",
            "start_date",
            "end_date",
            "fee",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        organization = _organization_for_serializer(self, attrs)
        classs = attrs.get("classs", getattr(self.instance, "classs", None))
        validate_same_organization(organization, classs=classs)
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and start > end:
            raise serializers.ValidationError(
                {"end_date": "End date must be on or after start date."}
            )
        return attrs


class ExamTypeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = [
            "id",
            "organization",
            "name",
            "start_date",
            "end_date",
            "batch",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        organization = _organization_for_serializer(self, attrs)
        batch = attrs.get("batch", getattr(self.instance, "batch", None))
        validate_same_organization(organization, batch=batch)
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and start > end:
            raise serializers.ValidationError(
                {"end_date": "End date must be on or after start date."}
            )
        return attrs


class ExamTypeSerializer(serializers.ModelSerializer):
    batch = BatchSerializer(read_only=True)

    class Meta:
        model = ExamType
        fields = "__all__"


class ExamWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = [
            "id",
            "organization",
            "exam_type",
            "subject",
            "name",
            "date",
            "pass_mark",
            "total_mark",
            "is_required",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        organization = _organization_for_serializer(self, attrs)
        exam_type = attrs.get(
            "exam_type", getattr(self.instance, "exam_type", None)
        )
        subject = attrs.get("subject", getattr(self.instance, "subject", None))
        validate_same_organization(
            organization, exam_type=exam_type, subject=subject
        )
        exam_date = attrs.get("date", getattr(self.instance, "date", None))
        if exam_type and exam_date and not (
            exam_type.start_date <= exam_date <= exam_type.end_date
        ):
            raise serializers.ValidationError(
                {"date": "Exam date must be within the exam type date range."}
            )
        pass_mark = attrs.get(
            "pass_mark", getattr(self.instance, "pass_mark", None)
        )
        total_mark = attrs.get(
            "total_mark", getattr(self.instance, "total_mark", None)
        )
        if pass_mark and total_mark and pass_mark > total_mark:
            raise serializers.ValidationError(
                {"pass_mark": "Pass mark cannot exceed total mark."}
            )
        return attrs


class ExamSerializer(serializers.ModelSerializer):
    exam_type = ExamTypeSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)

    class Meta:
        model = Exam
        fields = "__all__"


class ScheduleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = [
            "id",
            "organization",
            "title",
            "subject",
            "teacher",
            "batch",
            "duration",
            "date",
            "time",
            "exam",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        organization = _organization_for_serializer(self, attrs)
        subject = attrs.get("subject", getattr(self.instance, "subject", None))
        teacher = attrs.get("teacher", getattr(self.instance, "teacher", None))
        batch = attrs.get("batch", getattr(self.instance, "batch", None))
        exam = attrs.get("exam", getattr(self.instance, "exam", None))
        validate_same_organization(
            organization,
            subject=subject,
            teacher=teacher,
            batch=batch,
            exam=exam,
        )
        if not exam and not teacher:
            raise serializers.ValidationError(
                {"teacher": "Teacher is required when no exam is provided."}
            )
        if exam:
            errors = {}
            if batch and exam.exam_type.batch_id != batch.id:
                errors["batch"] = "Batch must match the selected exam."
            if subject and exam.subject_id != subject.id:
                errors["subject"] = "Subject must match the selected exam."
            date = attrs.get("date", getattr(self.instance, "date", None))
            if date and exam.date != date:
                errors["date"] = "Date must match the selected exam."
            if errors:
                raise serializers.ValidationError(errors)
        return attrs


class ScheduleSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    batch = BatchSerializer(read_only=True)
    exam = ExamSerializer(read_only=True)

    class Meta:
        model = Schedule
        fields = "__all__"


# Backwards-compatible names retained for existing imports.
ExamTypeCreateSerializer = ExamTypeWriteSerializer
ExamCreateSerializer = ExamWriteSerializer
ScheduleCreateSerializer = ScheduleWriteSerializer


class OrgShortInfoSerializer(serializers.Serializer):
    active_batches = serializers.IntegerField()
    active_classes = serializers.IntegerField()
    active_teachers = serializers.IntegerField()
