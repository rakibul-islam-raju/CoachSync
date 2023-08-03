from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models

from .managers import CustomUserManager

ROLES = (
    ("A", "Admin"),
    ("AS", "Admin Staff"),
    ("OA", "Organization Admin"),
    ("OS", "Organization Staff"),
    ("S", "student"),
    ("T", "teacher"),
)


class User(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=11, unique=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    role = models.CharField(choices=ROLES, max_length=2, blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.role and self.is_staff:
            self.role = "AS"
        elif not self.role and self.is_superuser:
            self.role = "A"

        super(User, self).save(*args, **kwargs)

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
