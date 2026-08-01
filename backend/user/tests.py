from unittest.mock import patch

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from user.models import ADMIN, ADMIN_STAFF, ORG_ADMIN, ORG_STAFF, User


class EmployeeAuthorizationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email="admin@example.com",
            password="Password123!",
            first_name="Platform",
            last_name="Admin",
            phone="01700000010",
        )
        self.admin_staff = self.create_user(
            "admin-staff@example.com", "01700000011", ADMIN_STAFF
        )
        self.org_admin = self.create_user(
            "org-admin@example.com", "01700000012", ORG_ADMIN
        )
        self.org_staff = self.create_user(
            "org-staff@example.com", "01700000013", ORG_STAFF
        )

    @staticmethod
    def create_user(email, phone, role):
        return User.objects.create_user(
            email=email,
            password="Password123!",
            first_name="Test",
            last_name="User",
            phone=phone,
            role=role,
            is_active=True,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_create_superuser_uses_admin_role(self):
        self.assertEqual(self.admin.role, ADMIN)

    def test_organization_roles_cannot_see_platform_users(self):
        self.authenticate(self.org_staff)

        response = self.client.get("/api/v1/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        visible_ids = {item["id"] for item in response.data["results"]}
        self.assertNotIn(self.admin.id, visible_ids)
        self.assertNotIn(self.admin_staff.id, visible_ids)
        self.assertIn(self.org_admin.id, visible_ids)
        self.assertIn(self.org_staff.id, visible_ids)

    def test_organization_staff_has_read_only_employee_access(self):
        self.authenticate(self.org_staff)
        payload = {
            "first_name": "Another",
            "last_name": "Staff",
            "email": "another-staff@example.com",
            "phone": "01700000014",
            "role": ORG_STAFF,
            "is_active": True,
        }

        create_response = self.client.post("/api/v1/users/", payload, format="json")
        update_response = self.client.patch(
            f"/api/v1/users/{self.org_admin.id}",
            {"first_name": "Changed"},
            format="json",
        )
        delete_response = self.client.delete(f"/api/v1/users/{self.org_admin.id}")

        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)

    @patch("user.serializers.send_email.delay")
    def test_organization_admin_can_create_and_manage_org_staff(self, send_email):
        self.authenticate(self.org_admin)
        payload = {
            "first_name": "Another",
            "last_name": "Staff",
            "email": "another-staff@example.com",
            "phone": "01700000014",
            "role": ORG_STAFF,
            "is_active": True,
        }

        create_response = self.client.post("/api/v1/users/", payload, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        employee_id = create_response.data["id"]
        update_response = self.client.patch(
            f"/api/v1/users/{employee_id}",
            {"first_name": "Updated"},
            format="json",
        )
        delete_response = self.client.delete(f"/api/v1/users/{employee_id}")

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        send_email.assert_called_once()

    def test_organization_admin_cannot_manage_peer(self):
        second_org_admin = self.create_user(
            "second-org-admin@example.com", "01700000015", ORG_ADMIN
        )
        self.authenticate(self.org_admin)

        response = self.client.patch(
            f"/api/v1/users/{second_org_admin.id}",
            {"first_name": "Changed"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch("user.serializers.send_email.delay")
    def test_admin_staff_can_only_assign_organization_roles(self, send_email):
        self.authenticate(self.admin_staff)
        payload = {
            "first_name": "Second",
            "last_name": "Admin Staff",
            "email": "second-admin-staff@example.com",
            "phone": "01700000016",
            "role": ADMIN_STAFF,
            "is_active": True,
        }

        response = self.client.post("/api/v1/users/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", response.data)
        send_email.assert_not_called()

    def test_privilege_flags_cannot_be_changed_through_employee_api(self):
        self.authenticate(self.admin)

        response = self.client.patch(
            f"/api/v1/users/{self.admin_staff.id}",
            {"is_superuser": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin_staff.refresh_from_db()
        self.assertFalse(self.admin_staff.is_superuser)


class SelfProfileApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="profile@example.com",
            password="Password123!",
            first_name="Old",
            last_name="Name",
            phone="01740000001",
            role=ORG_STAFF,
            is_active=True,
        )
        self.client.force_authenticate(self.user)

    def test_user_can_update_only_own_safe_profile_fields(self):
        response = self.client.patch(
            "/api/v1/users/me",
            {
                "first_name": "New",
                "email": "attacker@example.com",
                "role": ADMIN,
                "is_active": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "New")
        self.assertEqual(self.user.email, "profile@example.com")
        self.assertEqual(self.user.role, ORG_STAFF)
        self.assertTrue(self.user.is_active)
