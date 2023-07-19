from rest_framework import serializers

from user.serializers import UserSerializer

from .models import Subject, Teacher


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
