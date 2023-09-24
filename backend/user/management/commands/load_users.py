from django.core.management.base import BaseCommand

from user.models import User


class Command(BaseCommand):
    help = "Seeds the database with initial data"

    def handle(self, *args, **options):
        # create super admin
        password = "admin"
        user, created = User.objects.get_or_create(
            first_name="Super",
            last_name="Admin",
            email="admin@coachsync.com",
            phone="01234567891",
            is_active=True,
            is_staff=True,
            is_superuser=True,
            role="admin",
        )
        if created:
            user.set_password(password)
            user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"'{user.first_name} {user.last_name}' user created.\n"
                f"Email Address: '{user.email}'\nPassword: '{password}'"
            )
        )

        self.stdout.write(self.style.SUCCESS("Database seeded successfully."))
