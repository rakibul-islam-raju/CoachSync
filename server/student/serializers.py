from rest_framework import serializers

from .models import Student

from user.serializers import ExtendedUserSerializer
from user.models import User


class StudentSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer()

    class Meta:
        model = Student
        fields = "__all__"


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
        user_data["role"] = "S"
        new_user = User.objects.create(**user_data)

        try:
            # Create the Student instance and associate it with the new user
            new_student = Student.objects.create(user=new_user, **validated_data)
        except Exception as e:
            # If an exception occurs during Student creation, rollback the transaction
            new_user.delete()
            raise e

        return new_student


class EditStudentSerializer(serializers.ModelSerializer):
    user = ExtendedUserSerializer()

    class Meta:
        model = Student
        fields = "__all__"
        extra_kwargs = {
            "created_by": {"read_only": True},
        }

    def update(self, instance, validated_data):
        # Update user data if available in validated_data
        if "user" in validated_data:
            user_data = validated_data.pop("user")
            user_data["role"] = "S"
            user_serializer = ExtendedUserSerializer(
                instance.user, data=user_data, partial=True
            )
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()

        # Update Student instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
