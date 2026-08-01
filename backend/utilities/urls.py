from django.urls import path

from .views import LivenessView, ReadinessView


urlpatterns = [
    path("live", LivenessView.as_view(), name="health-live"),
    path("ready", ReadinessView.as_view(), name="health-ready"),
]
