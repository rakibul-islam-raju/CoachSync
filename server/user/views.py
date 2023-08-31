from django.shortcuts import get_object_or_404
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User, ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF
from .permissions import IsSuperUser, IsOrgStaff
from .serializers import UserSerializer


class MeApiView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        print(self.request.user)
        user = get_object_or_404(User, id=self.request.user.id)
        serializer = self.serializer_class(user, context={"request": request})
        return Response(serializer.data)


class UserListCreateView(ListCreateAPIView):
    permission_classes = [IsOrgStaff]
    serializer_class = UserSerializer
    filterset_fields = ["is_active", "is_staff", "is_superuser", "role"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = [
        "first_name",
        "last_name",
        "created_at",
        "updated_at",
    ]

    def get_queryset(self):
        user = self.request.user
        queryset = User.get_non_student_teacher_users()

        if user.role == ORG_ADMIN or user.role == ORG_STAFF:
            queryset.exclude(role__in=[ADMIN, ADMIN_STAFF])

        return queryset

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     if serializer.is_valid():
    #         email = serializer.validated_data["email"]
    #         user = serializer.save(password=None, is_active=False)

    #         # generate token for set new password
    #         token = "".join(random.choices(string.ascii_letters + string.digits, k=100))
    #         user.password_reset_token = token
    #         user.save()

    #         # email content
    #         to_email = email
    #         reset_url = f"{settings.FRONTEND_BASE_URL}/set-password/{token}"
    #         html_content = render_to_string(
    #             "set_password_email.html", {"reset_url": reset_url, "user": user}
    #         )
    #         plain_message = strip_tags(html_content)

    #         # send email to set password
    #         send_email(
    #             subject="Set your password",
    #             plain_message=plain_message,
    #             to_email=[to_email],
    #             html_content=html_content,
    #         )

    #         headers = self.get_success_headers(serializer.data)
    #         return Response(
    #             serializer.data, status=status.HTTP_201_CREATED, headers=headers
    #         )
    #     else:
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
    queryset = User.objects.all()
