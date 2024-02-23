from django.utils.html import strip_tags
from django.template.loader import render_to_string

from rest_framework import serializers

from .models import Subject, Teacher, Classs, Batch, ExamType, Exam, Schedule

from user.models import User
from user.serializers import UserSerializer, ExtendedUserSerializer
from utilities.tasks import send_email


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"
        extra_kwargs = {
            "created_by": {"read_only": True},
        }


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Subject
        fields = ["id", "user", "created_at", "updated_at", "is_active", "created_by"]


class TeacherCreateSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer()

    class Meta:
        model = Teacher
        fields = "__all__"
        extra_kwargs = {
            "created_by": {"read_only": True},
        }

    def create(self, validated_data):
        # Create user
        user_data = validated_data.pop("user")
        user_data["role"] = "teacher"

        try:
            # create new user
            new_user = User(**user_data)
            new_user.save()
            # Create the Teacher instance and associate it with the new user
            new_teacher = Teacher(user=new_user, **validated_data)
            new_teacher.save()

            # send registration confirmation email to the user
            email_subject = "Teacher registration"
            message = (
                "Contratulations!"
                "\nYou have been registered as a teacher."
                "\nRegards\nCoachSync"
            )
            html_content = render_to_string(
                "registration_confirmation.html", {"user": new_user, "message": message}
            )
            plain_message = strip_tags(html_content)
            send_email.delay(
                subject=email_subject,
                to_email=[new_user.email],
                html_content=html_content,
                plain_message=plain_message,
            )
        except Exception as e:
            # If an exception occurs during user or Teacher creation, rollback the transaction
            new_user.delete()
            new_teacher.delete()
            raise e

        return new_teacher

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user")

        try:
            # Update user data
            user_instance = instance.user
            for attr, value in user_data.items():
                setattr(user_instance, attr, value)
            user_instance.save()

            # Update teacher instance
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

        except Exception as e:
            raise e

        return instance


class ClasssSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classs
        fields = "__all__"
        extra_kwargs = {
            "created_by": {"read_only": True},
        }


class BatchSerializer(serializers.ModelSerializer):
    classs = ClasssSerializer()

    class Meta:
        model = Batch
        fields = "__all__"


class BatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = [
            "id",
            "name",
            "code",
            "classs",
            "start_date",
            "end_date",
            "fee",
            "is_active",
        ]


class ExamTypeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = [
            "name",
            "start_date",
            "end_date",
            "batch",
        ]


class ExamTypeSerializer(serializers.ModelSerializer):
    batch = BatchSerializer()

    class Meta:
        model = ExamType
        fields = "__all__"


class ExamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = [
            "exam_type",
            "subject",
            "name",
            "date",
            "pass_mark",
            "total_mark",
        ]


class ExamSerializer(serializers.ModelSerializer):
    exam_type = ExamTypeSerializer()
    subject = SubjectSerializer()

    class Meta:
        model = Exam
        fields = "__all__"


class ScheduleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = [
            "id",
            "title",
            "subject",
            "teacher",
            "batch",
            "duration",
            "date",
            "time",
            "exam",
        ]

    def validate(self, data):
        exam = data.get("exam")
        teacher = data.get("teacher")

        if not exam and not teacher:
            raise serializers.ValidationError(
                "Teacher is required when no exam is provided."
            )

        return data


class ScheduleSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()
    teacher = TeacherSerializer()
    batch = BatchSerializer()
    exam = ExamSerializer()

    class Meta:
        model = Schedule
        fields = "__all__"


class OrgShortInfoSerializer(serializers.Serializer):
    active_batches = serializers.IntegerField()
    active_classes = serializers.IntegerField()
    active_teachers = serializers.IntegerField()
