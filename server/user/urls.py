from django.urls import path

from .views import UserListView, UserDetailView, MeApiView

urlpatterns = [
    path("me", MeApiView.as_view(), name="me"),
    path("", UserListView.as_view(), name="user-list"),
    path("<pk>", UserDetailView.as_view(), name="user-detail"),
]
