from django.urls import path

from .views import UserListCreateView, UserDetailView, MeApiView

urlpatterns = [
    path("me", MeApiView.as_view(), name="me"),
    path("", UserListCreateView.as_view(), name="user-list"),
    path("<pk>", UserDetailView.as_view(), name="user-detail"),
]
