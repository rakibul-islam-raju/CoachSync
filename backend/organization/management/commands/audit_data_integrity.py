from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count, F
from django.db.models.functions import Lower

from organization.models import Batch, Classs, Exam, ExamType, Schedule, Subject
from student.models import Enroll, Student, Transaction


class Command(BaseCommand):
    help = "Report records that violate tenant and integrity constraints."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fail-on-error",
            action="store_true",
            help="Exit non-zero when violations are found.",
        )

    def handle(self, *args, **options):
        checks = {
            "classes with non-positive numeric values": Classs.objects.filter(
                numeric__lte=0
            ),
            "duplicate class names per organization": Classs.objects.annotate(
                normalized=Lower("name")
            )
            .values("organization_id", "normalized")
            .annotate(rows=Count("id"))
            .filter(rows__gt=1),
            "duplicate subject codes per organization": Subject.objects.annotate(
                normalized=Lower("code")
            )
            .values("organization_id", "normalized")
            .annotate(rows=Count("id"))
            .filter(rows__gt=1),
            "batches with reversed dates": Batch.objects.filter(
                start_date__isnull=False,
                end_date__isnull=False,
                start_date__gt=F("end_date"),
            ),
            "batches with non-positive fees": Batch.objects.filter(fee__lte=0),
            "exam types with reversed dates": ExamType.objects.filter(
                start_date__gt=F("end_date")
            ),
            "exams with invalid marks": Exam.objects.filter(
                pass_mark__gt=F("total_mark")
            )
            | Exam.objects.filter(pass_mark__lte=0)
            | Exam.objects.filter(total_mark__lte=0),
            "schedules with non-positive duration": Schedule.objects.filter(
                duration__lte=0
            ),
            "student tenant mismatches": Student.objects.exclude(
                organization_id=F("user__organization_memberships__organization_id")
            ),
            "enrollment student tenant mismatches": Enroll.objects.exclude(
                organization_id=F("student__organization_id")
            ),
            "enrollment batch tenant mismatches": Enroll.objects.exclude(
                organization_id=F("batch__organization_id")
            ),
            "invalid enrollment discounts": Enroll.objects.filter(
                discount_amount__gt=F("total_amount")
            ),
            "non-positive enrollment totals": Enroll.objects.filter(
                total_amount__lte=0
            ),
            "transaction enrollment tenant mismatches": Transaction.objects.exclude(
                organization_id=F("enroll__organization_id")
            ),
            "non-positive transaction amounts": Transaction.objects.filter(
                amount__lte=0
            ),
        }
        violations = 0
        for label, queryset in checks.items():
            count = queryset.distinct().count()
            violations += count
            status = self.style.ERROR(str(count)) if count else self.style.SUCCESS("0")
            self.stdout.write(f"{label}: {status}")
        if violations:
            message = f"Data audit found {violations} violation(s)."
            if options["fail_on_error"]:
                raise CommandError(message)
            self.stdout.write(self.style.WARNING(message))
        else:
            self.stdout.write(self.style.SUCCESS("Data audit passed."))
