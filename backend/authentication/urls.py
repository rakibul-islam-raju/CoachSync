from django.urls import path

from .views import (
    LoginView,
    ForgetPasswordView,
    UserSetPasswordView,
    ChangePasswordView,
    LogoutView,
)

urlpatterns = [
    path("login", LoginView.as_view(), name="login"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("forget-password", ForgetPasswordView.as_view(), name="forget-password"),
    path("set-password", UserSetPasswordView.as_view(), name="set-password"),
    path("change-password", ChangePasswordView.as_view(), name="change-password"),
]
