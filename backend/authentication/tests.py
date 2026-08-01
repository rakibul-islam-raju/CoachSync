from unittest.mock import patch

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from user.models import User


class AuthenticationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "ExistingPass123!"
        self.user = User.objects.create_user(
            email="staff@example.com",
            password=self.password,
            first_name="Staff",
            last_name="Member",
            phone="01700000001",
            role="org_staff",
            is_active=True,
        )

    def login(self):
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data

    def test_refresh_endpoint_returns_a_new_access_token(self):
        tokens = self.login()

        response = self.client.post(
            "/api/v1/auth/refresh",
            {"refresh": tokens["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_access_token_contains_role_for_client_authorization(self):
        tokens = self.login()

        user_claim = AccessToken(tokens["access"])["user"]

        self.assertEqual(user_claim["id"], self.user.id)
        self.assertEqual(user_claim["role"], self.user.role)

    def test_authenticated_user_can_change_own_password(self):
        tokens = self.login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        response = self.client.post(
            "/api/v1/auth/change-password",
            {
                "old_password": self.password,
                "new_password": "UpdatedPass456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("UpdatedPass456!"))

    def test_set_password_activates_user_and_clears_token(self):
        self.user.is_active = False
        self.user.password_reset_token = "a" * 100
        self.user.save()

        response = self.client.post(
            "/api/v1/auth/set-password",
            {
                "token": self.user.password_reset_token,
                "password": "ActivatedPass456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertEqual(self.user.password_reset_token, "")
        self.assertTrue(self.user.check_password("ActivatedPass456!"))

    @patch("authentication.views.send_email.delay")
    def test_forget_password_creates_token_and_queues_email(self, send_email):
        response = self.client.post(
            "/api/v1/auth/forget-password",
            {"email": self.user.email},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.user.refresh_from_db()
        self.assertEqual(len(self.user.password_reset_token), 100)
        send_email.assert_called_once()
