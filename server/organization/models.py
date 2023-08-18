from django.db import models

from user.models import User
from utilities.models import BaseModel


class Subject(BaseModel):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=16, unique=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.name


class Teacher(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teachers")

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.user


class Classs(BaseModel):
    # TODO: name should be unique (case insensative)
    name = models.CharField(max_length=20)
    numeric = models.IntegerField(unique=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"{self.name} - {self.numeric}"


class Batch(BaseModel):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=6, blank=True, null=True)
    classs = models.ForeignKey(Classs, on_delete=models.CASCADE)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    fee = models.PositiveIntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.name


class ExamType(BaseModel):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.name


class Exam(BaseModel):
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField()
    pass_mark = models.PositiveBigIntegerField()
    total_mark = models.PositiveBigIntegerField()

    objects = models.Manager()

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.name


class Schedule(BaseModel):
    title = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, blank=True, null=True
    )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    duration = models.PositiveIntegerField()
    date = models.DateField()
    time = models.TimeField()
    exam = models.ForeignKey(Exam, models.SET_NULL, blank=True, null=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.name
