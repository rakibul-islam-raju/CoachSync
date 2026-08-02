from decimal import Decimal
import secrets

from django.conf import settings
from django.db import transaction
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import serializers

from organization.models import OrganizationMembership
from organization.serializers import BatchSerializer
from organization.tenancy import resolve_request_organization, validate_same_organization
from user.models import GUARDIAN, STUDENT, User
from user.serializers import ExtendedUserSerializer
from utilities.tasks import send_email

from .models import Enroll, Student, StudentGuardian, Transaction


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
            subject="Set up your student account",
            to_email=[user.email],
            html_content=html_content,
            plain_message=plain_message,
        )
    )


def _queue_guardian_invitation(user):
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
            subject="Set up your guardian account",
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


class GuardianUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "phone", "is_active"]


class StudentGuardianSerializer(serializers.ModelSerializer):
    guardian = GuardianUserSerializer(read_only=True)

    class Meta:
        model = StudentGuardian
        fields = [
            "id",
            "student",
            "guardian",
            "relationship",
            "is_primary",
            "result_email_enabled",
            "is_active",
            "created_at",
        ]


class StudentGuardianCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=11)
    relationship = serializers.ChoiceField(choices=StudentGuardian.RELATIONSHIPS)
    is_primary = serializers.BooleanField(default=False)
    result_email_enabled = serializers.BooleanField(default=True)

    def validate(self, attrs):
        existing_email = User.objects.filter(email=attrs["email"]).first()
        existing_phone = User.objects.filter(phone=attrs["phone"]).first()
        existing = existing_email or existing_phone
        if existing_email and existing_phone and existing_email != existing_phone:
            raise serializers.ValidationError(
                "The email and phone belong to different existing accounts."
            )
        if existing and existing.role != GUARDIAN:
            raise serializers.ValidationError(
                "The existing account is not a guardian account."
            )
        attrs["_existing_user"] = existing
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        student = self.context["student"]
        organization = student.organization
        actor = self.context["request"].user
        existing = validated_data.pop("_existing_user")
        relationship = validated_data.pop("relationship")
        is_primary = validated_data.pop("is_primary")
        result_email_enabled = validated_data.pop("result_email_enabled")
        if existing:
            guardian = existing
        else:
            guardian = User.objects.create(role=GUARDIAN, **validated_data)
            _queue_guardian_invitation(guardian)
        OrganizationMembership.objects.update_or_create(
            organization=organization,
            user=guardian,
            defaults={"is_default": True, "created_by": actor},
        )
        link, created = StudentGuardian.objects.get_or_create(
            organization=organization,
            student=student,
            guardian=guardian,
            defaults={
                "relationship": relationship,
                "is_primary": is_primary,
                "result_email_enabled": result_email_enabled,
                "created_by": actor,
            },
        )
        if not created:
            raise serializers.ValidationError("This guardian is already linked.")
        if is_primary:
            StudentGuardian.objects.filter(
                organization=organization, student=student, is_primary=True
            ).exclude(pk=link.pk).update(is_primary=False)
        return link

    def to_representation(self, instance):
        return StudentGuardianSerializer(instance, context=self.context).data


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
    payment_method_name = serializers.CharField(
        source="payment_method.name", read_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "organization",
            "enroll",
            "amount",
            "transaction_type",
            "remark",
            "payment_method",
            "payment_method_name",
            "installment",
            "reference_number",
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
        payment_method = attrs.get("payment_method")
        if payment_method:
            if payment_method.organization_id != enroll.organization_id:
                raise serializers.ValidationError(
                    {"payment_method": "The selected method belongs to another organization."}
                )
            if not payment_method.is_active:
                raise serializers.ValidationError(
                    {"payment_method": "Select an active payment method."}
                )
        installment = attrs.get("installment")
        if installment:
            if installment.invoice.enroll_id != enroll.id:
                raise serializers.ValidationError(
                    {"installment": "The selected installment belongs to another enrollment."}
                )
            if amount > installment.balance:
                raise serializers.ValidationError(
                    {"amount": f"Payment exceeds the installment balance of {installment.balance}."}
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
