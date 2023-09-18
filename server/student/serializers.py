from django.utils.html import strip_tags
from django.template.loader import render_to_string

from rest_framework import serializers

from .models import Student, Enroll, Transaction

from user.serializers import ExtendedUserSerializer
from organization.serializers import BatchSerializer
from user.models import User
from utilities.utils import send_email


class EnrollSerializerForStudentDetails(serializers.ModelSerializer):
    total_paid = serializers.SerializerMethodField()
    batch = BatchSerializer()

    class Meta:
        model = Enroll
        fields = "__all__"

    def get_total_paid(self, object):
        return object.total_paid


class StudentSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer()

    class Meta:
        model = Student
        fields = "__all__"

    def to_representation(self, instance):
        # Get the default representation (dictionary) of the student
        representation = super().to_representation(instance)

        # # Fetch and serialize the related enrollments
        enrollments = Enroll.objects.filter(student=instance.id)
        enrollments_data = EnrollSerializerForStudentDetails(
            enrollments, many=True
        ).data

        # Include the serialized enrollments in the representation
        representation["enrolls"] = enrollments_data

        return representation


class CreateStudentSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer()

    class Meta:
        model = Student
        fields = "__all__"
        extra_kwargs = {
            "created_by": {"read_only": True},
        }

    def create(self, validated_data):
        # Create user
        user_data = validated_data.pop("user")
        user_data["role"] = "student"

        try:
            # create new user
            new_user = User(**user_data)
            new_user.save()
            # Create the Student instance and associate it with the new user
            new_student = Student(user=new_user, **validated_data)
            new_student.save()

            # send registration confirmation email to the user
            email_subject = "Student registration"
            message = (
                "Contratulations!"
                "\nYou have been registered as a student."
                "\nRegards\nCoachSync"
            )
            html_content = render_to_string(
                "registration_confirmation.html", {"user": new_user, "message": message}
            )
            plain_message = strip_tags(html_content)
            send_email(
                subject=email_subject,
                to_email=[new_user.email],
                html_content=html_content,
                plain_message=plain_message,
            )
        except Exception as e:
            # If an exception occurs during user or Teacher creation, rollback the transaction
            new_user.delete()
            new_student.delete()
            raise e

        return new_student

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user")

        try:
            # Update user data
            user_instance = instance.user
            for attr, value in user_data.items():
                setattr(user_instance, attr, value)
            user_instance.save()

            # Update student instance
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

        except Exception as e:
            raise e

        return instance


class EnrollCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enroll
        fields = [
            "id",
            "student",
            "batch",
            "total_amount",
            "discount_amount",
            "reference_by",
        ]
        extra_kwargs = {
            "id": {"read_only": True},
        }

    def validate(self, data):
        exists = Enroll.objects.filter(
            student=data.get("student"), batch=data.get("batch")
        )
        if exists:
            raise serializers.ValidationError("You have already enrolled in this batch")
        return data


class EnrollSerializer(serializers.ModelSerializer):
    total_paid = serializers.SerializerMethodField()
    student = StudentSerializer()
    batch = BatchSerializer()

    class Meta:
        model = Enroll
        fields = "__all__"

    def get_total_paid(self, object):
        return object.total_paid


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"


class StudentsShortStatSerializer(serializers.Serializer):
    students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    inactive_students = serializers.IntegerField()
    enrolls = serializers.IntegerField()
    paid_enrolls = serializers.IntegerField()
    due_enrolls = serializers.IntegerField()


class YearlyTransactionStatsSerializer(serializers.Serializer):
    month = serializers.IntegerField()
    total_amount = serializers.IntegerField()

    class Meta:
        model = Transaction
        fileds = []
