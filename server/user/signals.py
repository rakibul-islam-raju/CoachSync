from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User

from organization.models import Teacher
from student.models import Student


# create student
# @receiver(post_save, sender=User)
# def create_student(sender, instance, created, **kwargs):
#     if instance.role == "S":
#         if created:
#             Student.objects.create(user=instance)


# create teacher
@receiver(post_save, sender=User)
def create_teacher(sender, instance, created, **kwargs):
    if instance.role == "T":
        if created:
            Teacher.objects.create(user=instance)
