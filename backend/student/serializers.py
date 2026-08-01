from decimal import Decimal

from django.db import transaction
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import serializers

from organization.models import OrganizationMembership
from organization.serializers import BatchSerializer
from organization.tenancy import resolve_request_organization, validate_same_organization
from user.models import STUDENT, User
from user.serializers import ExtendedUserSerializer
from utilities.tasks import send_email

from .models import Enroll, Student, Transaction


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


def _queue_student_registration(user):
    message = (
        "Congratulations!\nYou have been registered as a student."
        "\nRegards\nCoachSync"
    )
    html_content = render_to_string(
        "registration_confirmation.html", {"user": user, "message": message}
    )
    plain_message = strip_tags(html_content)
    transaction.on_commit(
        lambda: send_email.delay(
            subject="Student registration",
            to_email=[user.email],
            html_content=html_content,
            plain_message=plain_message,
        )
    )


class EnrollSerializerForStudentDetails(serializers.ModelSerializer):
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    net_payable = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    batch = BatchSerializer(read_only=True)

    class Meta:
        model = Enroll
        fields = "__all__"


class StudentSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer(read_only=True)
    enrolls = EnrollSerializerForStudentDetails(many=True, read_only=True)

    class Meta:
        model = Student
        fields = "__all__"


class CreateStudentSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer()

    class Meta:
        model = Student
        fields = "__all__"
        read_only_fields = ["id", "student_id", "created_by"]

    def validate(self, attrs):
        _organization_for_serializer(self, attrs)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop("user")
        organization = validated_data.pop("organization", None) or _organization_for_serializer(
            self, validated_data
        )
        user = User.objects.create(role=STUDENT, **user_data)
        student = Student.objects.create(
            user=user, organization=organization, **validated_data
        )
        OrganizationMembership.objects.update_or_create(
            organization=organization,
            user=user,
            defaults={"is_default": True, "created_by": validated_data.get("created_by")},
        )
        _queue_student_registration(user)
        return student

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


class EnrollCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enroll
        fields = [
            "id",
            "organization",
            "student",
            "batch",
            "total_amount",
            "discount_amount",
            "reference_by",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        organization = _organization_for_serializer(self, attrs)
        student = attrs.get("student", getattr(self.instance, "student", None))
        batch = attrs.get("batch", getattr(self.instance, "batch", None))
        validate_same_organization(organization, student=student, batch=batch)
        discount = attrs.get(
            "discount_amount", getattr(self.instance, "discount_amount", 0)
        ) or 0
        total = attrs.get("total_amount", getattr(self.instance, "total_amount", 0))
        if discount > total:
            raise serializers.ValidationError(
                {"discount_amount": "Discount cannot exceed total amount."}
            )
        duplicate = Enroll.objects.filter(
            organization=organization,
            student=student,
            batch=batch,
            status=Enroll.ACTIVE,
        )
        if self.instance:
            duplicate = duplicate.exclude(pk=self.instance.pk)
        if duplicate.exists():
            raise serializers.ValidationError(
                {"non_field_errors": ["The student already has an active enrollment in this batch."]}
            )
        if self.instance and self.instance.status == Enroll.CANCELLED:
            raise serializers.ValidationError("Cancelled enrollments cannot be edited.")
        return attrs


class EnrollSerializer(serializers.ModelSerializer):
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    net_payable = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    student = StudentSerializer(read_only=True)
    batch = BatchSerializer(read_only=True)

    class Meta:
        model = Enroll
        fields = "__all__"


class EnrollListStudentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "full_name"]


class EnrollListStudentSerializer(serializers.ModelSerializer):
    user = EnrollListStudentUserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "student_id", "user"]


class EnrollListSerializer(serializers.ModelSerializer):
    student = EnrollListStudentSerializer(read_only=True)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    net_payable = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Enroll
        fields = [
            "id",
            "organization",
            "student",
            "batch",
            "total_amount",
            "discount_amount",
            "net_payable",
            "total_paid",
            "balance",
            "status",
            "cancelled_at",
            "cancellation_reason",
        ]


class TransactionSerializer(serializers.ModelSerializer):
    is_reversed = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "id",
            "organization",
            "enroll",
            "amount",
            "transaction_type",
            "remark",
            "reversal_of",
            "created_by",
            "created_at",
            "is_reversed",
        ]
        read_only_fields = [
            "id",
            "organization",
            "enroll",
            "transaction_type",
            "reversal_of",
            "created_by",
            "created_at",
            "is_reversed",
        ]

    def get_is_reversed(self, transaction) -> bool:
        return hasattr(transaction, "reversal")

    def validate(self, attrs):
        enroll = self.context.get("enroll")
        if not enroll:
            raise serializers.ValidationError("Enrollment context is required.")
        if enroll.status != Enroll.ACTIVE:
            raise serializers.ValidationError(
                {"enroll": "Payments cannot be added to a cancelled enrollment."}
            )
        amount = attrs.get("amount", 0)
        if amount > enroll.balance:
            raise serializers.ValidationError(
                {"amount": f"Payment exceeds the outstanding balance of {enroll.balance}."}
            )
        return attrs


class TransactionReversalSerializer(serializers.Serializer):
    remark = serializers.CharField(max_length=100)
    replacement_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal("0.01"), required=False
    )


class EnrollmentCancellationSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=255)


class StudentsShortStatSerializer(serializers.Serializer):
    students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    inactive_students = serializers.IntegerField()
    enrolls = serializers.IntegerField()
    paid_enrolls = serializers.IntegerField()
    due_enrolls = serializers.IntegerField()


class YearlyTransactionStatsSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    total_amount = serializers.FloatField()
