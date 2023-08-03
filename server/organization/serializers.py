from rest_framework import serializers

from user.serializers import UserSerializer
from user.serializers import ExtendedUserSerializer

from .models import Subject, Teacher, Classs, Batch, ExamType, Exam, Schedule


class SubjectCerateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["name", "code"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


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
        user_data["role"] = "S"
        new_user = Teacher.objects.create(**user_data)

        try:
            # Create the Teacher instance and associate it with the new user
            new_teacher = Teacher.objects.create(user=new_user, **validated_data)
        except Exception as e:
            # If an exception occurs during Teacher creation, rollback the transaction
            new_user.delete()
            raise e

        return new_teacher


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
            "name",
            "code",
            "classs",
            "start_date",
            "end_date",
            "fee",
            "description",
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
            "title",
            "subject",
            "teacher",
            "batch",
            "duration",
            "date",
            "time",
            "exam",
        ]


class ScheduleSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()
    teacher = TeacherSerializer()
    batch = BatchSerializer()
    exam = ExamSerializer()

    class Meta:
        model = Schedule
        fields = "__all__"
