import os
import json
import random
from datetime import datetime, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError
from faker import Faker

from organization.models import Classs, Teacher, Subject, Batch, Schedule
from organization.serializers import (
    TeacherCreateSerializer,
    SubjectSerializer,
    ClasssSerializer,
    BatchCreateSerializer,
    ScheduleCreateSerializer,
)

from student.models import Student
from student.serializers import (
    CreateStudentSerializer,
    EnrollCreateSerializer,
    TransactionSerializer,
)

fake = Faker()


class Command(BaseCommand):
    help = "Seed Database"

    def handle(self, *args, **kwargs):
        seed_data_dir = os.path.join(settings.BASE_DIR, "seed_data")

        """
        seed subjects
        """
        try:
            json_file_path = os.path.join(seed_data_dir, "subjects.json")
            with open(json_file_path) as json_file:
                data = json.load(json_file)

            for item in data:
                try:
                    serializer = SubjectSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                        self.stdout.write(self.style.SUCCESS("Subject Created!"))
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f"Failed to seed subjects: {serializer.errors}"
                            )
                        )
                except IntegrityError:
                    continue
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {str(e)}"))

        """
        seed classes
        """
        try:
            json_file_path = os.path.join(seed_data_dir, "classes.json")
            with open(json_file_path) as json_file:
                data = json.load(json_file)

            for item in data:
                try:
                    serializer = ClasssSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                        self.stdout.write(self.style.SUCCESS("Class Created!"))
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f"Failed to seed subjects: {serializer.errors}"
                            )
                        )
                except IntegrityError:
                    continue
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {str(e)}"))

        """
        seed batches
        """
        try:
            json_file_path = os.path.join(seed_data_dir, "batches.json")
            with open(json_file_path) as json_file:
                data = json.load(json_file)

            for item in data:
                try:
                    classs = Classs.objects.get(numeric=item.get("classs"))
                    modData = {**item, "classs": classs.id}
                    serializer = BatchCreateSerializer(data=modData)
                    if serializer.is_valid():
                        serializer.save()
                        self.stdout.write(self.style.SUCCESS("Batch Created!"))
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f"Failed to seed subjects: {serializer.errors}"
                            )
                        )
                except IntegrityError:
                    continue
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {str(e)}"))

        """
        seed teachers
        """
        if not Teacher.objects.all().count() >= 10:
            num_teachers_to_seed = 10
            for _ in range(num_teachers_to_seed):
                # Generate fake teacher data
                fake_teacher_data = {
                    "user": {
                        "first_name": fake.first_name(),
                        "last_name": fake.last_name(),
                        "email": fake.email(),
                        "phone": fake.numerify(text="###########"),
                    },
                }
                try:
                    serializer = TeacherCreateSerializer(data=fake_teacher_data)

                    if serializer.is_valid():
                        serializer.save()
                        self.stdout.write(self.style.SUCCESS("Teacher created!"))
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f"Failed to create teacher: {serializer.errors}"
                            )
                        )
                except IntegrityError:
                    continue

        """
        seed schedules
        """
        if not Schedule.objects.all().count() >= 100:
            num_schedules_to_seed = 100

            subjects = Subject.objects.all()
            teachers = Teacher.objects.all()
            batches = Batch.objects.all()

            for _ in range(num_schedules_to_seed):
                # Select random Subject, Teacher, and Batch
                subject = random.choice(subjects)
                teacher = random.choice(teachers)
                batch = random.choice(batches)

                # Generate fake data for Schedule
                fake_schedule_data = {
                    "title": fake.word(),
                    "subject": subject.id,
                    "teacher": teacher.id,
                    "batch": batch.id,
                    "duration": random.randint(40, 60),
                    "date": fake.date_between(start_date="-2d", end_date="+200d"),
                    "time": fake.time(),
                    "exam": None,
                }

                try:
                    serializer = ScheduleCreateSerializer(data=fake_schedule_data)

                    if serializer.is_valid():
                        serializer.save()
                        self.stdout.write(self.style.SUCCESS("Schedule created!"))
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f"Failed to create schedule: {serializer.errors}"
                            )
                        )
                except IntegrityError:
                    continue

        """
        seed Students , enrolls and transactions
        """

        if not Student.objects.all().count() >= 100:
            num_students_to_seed = 120
            for _ in range(num_students_to_seed):
                # Generate fake student data
                fake_student_data = {
                    "user": {
                        "first_name": fake.first_name(),
                        "last_name": fake.last_name(),
                        "email": fake.email(),
                        "phone": fake.numerify(text="###########"),
                    },
                    "student_id": fake.unique.random_int(
                        min=100000, max=999999
                    ),  # Generates a unique student ID
                    "emergency_contact_no": fake.numerify(text="###########"),
                    "date_of_birth": fake.date_of_birth(minimum_age=15, maximum_age=30),
                    "blood_group": random.choice(
                        ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
                    ),
                    "address": fake.address(),
                    "description": fake.text(max_nb_chars=100),
                }

                # Create and validate the student serializer
                student_serializer = CreateStudentSerializer(data=fake_student_data)

                if student_serializer.is_valid():
                    student = student_serializer.save()
                    self.stdout.write(self.style.SUCCESS("Student created"))

                    # Generate enrollments and transactions for the student
                    self.generate_enrollments_and_transactions(student)
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Failed to create student: {student_serializer.errors}"
                        )
                    )

    def generate_enrollments_and_transactions(self, student):
        num_enrollments = random.randint(1, 3)

        for _ in range(num_enrollments):
            # Generate fake enrollment data
            batch = random.choice(Batch.objects.all())
            fake_enroll_data = {
                "student": student.id,
                "batch": batch.pk,
                "total_amount": batch.fee,
                "discount_amount": random.randint(0, 500),
            }

            # Create and validate the enrollment serializer
            enroll_serializer = EnrollCreateSerializer(data=fake_enroll_data)

            if enroll_serializer.is_valid():
                enrollment = enroll_serializer.save()
                self.stdout.write(self.style.SUCCESS("Enrollment created"))

                # Generate transactions for the enrollment
                self.generate_transactions(enrollment)
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to create enrollment: {enroll_serializer.errors}"
                    )
                )

    def generate_transactions(self, enrollment):
        num_transactions = random.randint(1, 2)
        start_date = datetime.now()
        end_date = datetime.now() + timedelta(120)

        for _ in range(num_transactions):
            # Generate fake transaction data
            fake_transaction_data = {
                "enroll": enrollment.pk,
                "amount": random.randint(5000, 8000),
                "remark": fake.text(max_nb_chars=100),
            }

            # Set a custom created_at date (replace with your desired date and time)
            custom_created_at = self.generate_random_date(start_date, end_date)

            # Create and validate the transaction serializer
            transaction_serializer = TransactionSerializer(data=fake_transaction_data)
            if transaction_serializer.is_valid():
                transaction = transaction_serializer.save()

                # Set the custom created_at date just before saving the transaction
                transaction.created_at = custom_created_at
                transaction.save()

                self.stdout.write(
                    self.style.SUCCESS("Transaction created: {transaction}")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to create transaction: {transaction_serializer.errors}"
                    )
                )

    def generate_random_date(self, start_date, end_date):
        # Generate a random datetime within the specified range
        time_difference = end_date - start_date
        random_time_delta = random.randint(0, int(time_difference.total_seconds()))
        random_date = start_date + timedelta(seconds=random_time_delta)
        return random_date
