from django.conf import settings
from django.db import connections
from redis import Redis
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class LivenessView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        responses=inline_serializer(
            name="LivenessResponse",
            fields={"status": serializers.CharField()},
        )
    )
    def get(self, request):
        return Response({"status": "ok"})


class ReadinessView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        responses={
            200: inline_serializer(
                name="ReadinessResponse",
                fields={
                    "status": serializers.CharField(),
                    "checks": serializers.DictField(
                        child=serializers.BooleanField()
                    ),
                },
            ),
            503: inline_serializer(
                name="ReadinessUnavailableResponse",
                fields={
                    "status": serializers.CharField(),
                    "checks": serializers.DictField(
                        child=serializers.BooleanField()
                    ),
                },
            ),
        }
    )
    def get(self, request):
        checks = {"database": False, "redis": False}
        try:
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            checks["database"] = True
        except Exception:
            pass

        try:
            client = Redis.from_url(
                settings.CELERY_BROKER_URL,
                socket_connect_timeout=1,
                socket_timeout=1,
            )
            checks["redis"] = bool(client.ping())
        except Exception:
            pass

        ready = all(checks.values())
        return Response(
            {"status": "ok" if ready else "unavailable", "checks": checks},
            status=status.HTTP_200_OK
            if ready
            else status.HTTP_503_SERVICE_UNAVAILABLE,
        )
