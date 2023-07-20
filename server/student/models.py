from django.db import models

from user.models import User
from organization.models import Classs, Batch
from utilities.models import BaseModel

BLOOD_GROUPS = (
    ("A+", "A+"),
    ("A-", "A-"),
    ("B+", "B+"),
    ("B-", "B-"),
    ("O+", "O+"),
    ("O-", "O-"),
    ("AB+", "AB+"),
    ("AB-", "AB-"),
)


class Student(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    classs = models.ForeignKey(
        Classs, on_delete=models.SET_NULL, null=True, related_name="students"
    )
    batch = models.ForeignKey(
        Batch, on_delete=models.SET_NULL, null=True, related_name="students"
    )
    emergency_contact_no = models.CharField(max_length=11, null=True)
    date_of_birth = models.DateField(null=True)
    blood_group = models.CharField(
        max_length=3, choices=BLOOD_GROUPS, blank=True, null=True
    )
    address = models.TextField(null=True)
    description = models.TextField(null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.user.email


class Enroll(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="enrolls"
    )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="enrolls")
    total_amount = models.PositiveIntegerField()
    discount_amount = models.PositiveIntegerField(default=0)
    paid_amount = models.PositiveIntegerField(default=0)
    reference_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="references",
    )

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.student


class Transaction(BaseModel):
    amount = models.PositiveIntegerField()
    enroll = models.ForeignKey(Enroll, on_delete=models.CASCADE)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.enroll
