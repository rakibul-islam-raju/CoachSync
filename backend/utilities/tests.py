from unittest.mock import patch

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class HealthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_liveness_does_not_require_authentication(self):
        response = self.client.get("/health/live")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"status": "ok"})

    @patch("utilities.views.Redis.from_url")
    def test_readiness_checks_database_and_redis(self, redis_from_url):
        redis_from_url.return_value.ping.return_value = True

        response = self.client.get("/health/ready")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {"status": "ok", "checks": {"database": True, "redis": True}},
        )

    @patch("utilities.views.Redis.from_url")
    def test_readiness_returns_503_when_redis_is_unavailable(self, redis_from_url):
        redis_from_url.side_effect = ConnectionError

        response = self.client.get("/health/ready")

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertFalse(response.data["checks"]["redis"])
