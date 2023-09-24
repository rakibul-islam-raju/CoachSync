from datetime import date
from functools import cached_property

from django.db import models
from django.db.models import Sum

from user.models import User
from organization.models import Batch
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
    student_id = models.CharField(
        max_length=50, db_index=True, unique=True, blank=True, null=False
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
        return self.student_id

    def save(self, *args, **kwargs):
        if not self.student_id:
            # Generate a unique student ID based on current date and UUID
            today = date.today()
            formatted_year = str(today.year)[-2:]
            formatted_date = today.strftime("%m%d")

            # Check if the instance has an ID (has been saved to the database)
            if self.id is None:
                super().save(*args, **kwargs)  # Save the instance to get an ID

            self.student_id = f"ST{self.id}-{formatted_year}{formatted_date}"

        super().save(*args, **kwargs)


class Enroll(BaseModel):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="enrolls"
    )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="enrolls")
    total_amount = models.PositiveIntegerField()
    discount_amount = models.PositiveIntegerField(default=0, blank=True, null=True)
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
        return self.student.student_id

    @cached_property
    def total_paid(self):
        return (
            self.transactions.aggregate(total_amount=Sum("amount"))["total_amount"] or 0
        )

    @classmethod
    def get_paid_enrolls(cls):
        # Get all enrolls where the total paid amount is equal to or greater than the total amount
        return cls.objects.annotate(
            total_paid_amount=Sum("transactions__amount")
        ).filter(total_paid_amount__gte=models.F("total_amount"))

    @classmethod
    def get_due_enrolls(cls):
        # Get all enrolls where the total paid amount is less than the total amount
        return cls.objects.annotate(
            total_paid_amount=Sum("transactions__amount")
        ).filter(total_paid_amount__lt=models.F("total_amount"))


class Transaction(BaseModel):
    amount = models.IntegerField()
    enroll = models.ForeignKey(
        Enroll, on_delete=models.CASCADE, related_name="transactions"
    )
    remark = models.CharField(max_length=100, blank=True, null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.enroll.student.student_id
