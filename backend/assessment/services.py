from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from organization.models import Exam, ExamType
from student.models import StudentGuardian

from .models import (
    ExamCandidate,
    ExamMark,
    GradeScale,
    Outcome,
    OutcomeLine,
    ResultDelivery,
    ResultPublication,
)


TWOPLACES = Decimal("0.01")


def grade_for_percentage(scale: GradeScale, percentage: Decimal):
    band = scale.bands.filter(
        minimum_percentage__lte=percentage,
        maximum_percentage__gte=percentage,
    ).first()
    if not band:
        raise ValidationError(
            f"The grade scale does not cover {percentage}% results."
        )
    return band


def review_exam_type(exam_type: ExamType):
    exams = list(exam_type.exam_set.filter(is_active=True).order_by("date", "id"))
    candidates = list(exam_type.candidates.filter(is_eligible=True, is_active=True))
    marks = ExamMark.objects.filter(
        exam__in=exams, candidate__in=candidates, is_active=True
    )
    expected = len(exams) * len(candidates)
    counts = defaultdict(int)
    for value in marks.values_list("workflow_status", flat=True):
        counts[value] += 1
    exam_rows = []
    for exam in exams:
        exam_marks = marks.filter(exam=exam)
        exam_rows.append(
            {
                "exam": exam.id,
                "name": exam.name,
                "subject": exam.subject.name,
                "entered": exam_marks.count(),
                "verified": exam_marks.filter(
                    workflow_status=ExamMark.VERIFIED
                ).count(),
                "expected": len(candidates),
            }
        )
    return {
        "exam_type": exam_type.id,
        "exam_type_name": exam_type.name,
        "candidate_count": len(candidates),
        "exam_count": len(exams),
        "expected_marks": expected,
        "entered_marks": marks.count(),
        "draft_marks": counts[ExamMark.DRAFT],
        "submitted_marks": counts[ExamMark.SUBMITTED],
        "verified_marks": counts[ExamMark.VERIFIED],
        "missing_marks": max(expected - marks.count(), 0),
        "ready_to_publish": bool(expected and counts[ExamMark.VERIFIED] == expected),
        "exams": exam_rows,
    }


@transaction.atomic
def publish_results(*, exam_type, organization, grade_scale, user, message="", show_rank=False):
    exam_type = ExamType.objects.select_for_update().get(
        pk=exam_type.pk, organization=organization
    )
    if ResultPublication.objects.filter(
        organization=organization,
        exam_type=exam_type,
        status=ResultPublication.PUBLISHED,
    ).exists():
        raise ValidationError(
            "Results are already published. Reopen them before publishing a correction."
        )

    exams = list(
        Exam.objects.filter(
            organization=organization, exam_type=exam_type, is_active=True
        ).select_related("subject")
    )
    candidates = list(
        ExamCandidate.objects.filter(
            organization=organization,
            exam_type=exam_type,
            is_eligible=True,
            is_active=True,
        ).select_related("student__user")
    )
    if not exams or not candidates:
        raise ValidationError("Generate candidates and configure exams before publishing.")

    marks = list(
        ExamMark.objects.select_for_update()
        .filter(
            organization=organization,
            exam__in=exams,
            candidate__in=candidates,
            is_active=True,
        )
        .select_related("exam__subject", "candidate__student__user")
    )
    expected = len(exams) * len(candidates)
    if len(marks) != expected:
        raise ValidationError(f"{expected - len(marks)} required marks are missing.")
    if any(mark.workflow_status != ExamMark.VERIFIED for mark in marks):
        raise ValidationError("All marks must be verified before publishing.")

    by_candidate = defaultdict(dict)
    for mark in marks:
        by_candidate[mark.candidate_id][mark.exam_id] = mark

    version = (
        ResultPublication.objects.filter(
            organization=organization, exam_type=exam_type
        ).count()
        + 1
    )
    publication = ResultPublication.objects.create(
        organization=organization,
        exam_type=exam_type,
        grade_scale=grade_scale,
        version=version,
        message=message,
        show_rank=show_rank,
        published_by=user,
        published_at=timezone.now(),
        created_by=user,
    )

    created_outcomes = []
    for candidate in candidates:
        total_obtained = Decimal("0.00")
        total_possible = Decimal("0.00")
        subject_rows = []
        required_passes = []
        for exam in exams:
            mark = by_candidate[candidate.id][exam.id]
            obtained = mark.obtained_mark if mark.attendance_status == ExamMark.PRESENT else None
            if mark.attendance_status != ExamMark.EXEMPT:
                total_possible += Decimal(exam.total_mark)
                total_obtained += obtained or Decimal("0.00")
            line_percentage = None
            band = None
            passed = False
            if mark.attendance_status == ExamMark.PRESENT:
                line_percentage = (
                    (obtained / Decimal(exam.total_mark)) * 100
                ).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
                band = grade_for_percentage(grade_scale, line_percentage)
                passed = obtained >= Decimal(exam.pass_mark)
            elif mark.attendance_status == ExamMark.EXEMPT:
                passed = True
            if exam.is_required:
                required_passes.append(passed)
            subject_rows.append((exam, mark, obtained, line_percentage, band, passed))

        if total_possible <= 0:
            raise ValidationError(
                f"{candidate.student.student_id} has no graded subjects."
            )
        percentage = ((total_obtained / total_possible) * 100).quantize(
            TWOPLACES, rounding=ROUND_HALF_UP
        )
        overall_band = grade_for_percentage(grade_scale, percentage)
        outcome = Outcome.objects.create(
            organization=organization,
            publication=publication,
            student=candidate.student,
            total_obtained=total_obtained,
            total_possible=total_possible,
            percentage=percentage,
            grade=overall_band.grade,
            grade_point=overall_band.grade_point,
            has_passed=all(required_passes),
            created_by=user,
        )
        OutcomeLine.objects.bulk_create(
            [
                OutcomeLine(
                    outcome=outcome,
                    exam=exam,
                    attendance_status=mark.attendance_status,
                    obtained_mark=obtained,
                    total_mark=exam.total_mark,
                    pass_mark=exam.pass_mark,
                    percentage=line_percentage,
                    grade=band.grade if band else "",
                    grade_point=band.grade_point if band else None,
                    has_passed=passed,
                )
                for exam, mark, obtained, line_percentage, band, passed in subject_rows
            ]
        )
        created_outcomes.append(outcome)

    ranked = sorted(
        created_outcomes,
        key=lambda item: (item.percentage, item.total_obtained),
        reverse=True,
    )
    previous_score = None
    current_rank = 0
    for index, outcome in enumerate(ranked, start=1):
        score = (outcome.percentage, outcome.total_obtained)
        if score != previous_score:
            current_rank = index
            previous_score = score
        outcome.rank = current_rank
    Outcome.objects.bulk_update(ranked, ["rank"])

    delivery_ids = []
    for outcome in created_outcomes:
        recipients = {outcome.student.user_id: (outcome.student.user, True)}
        links = StudentGuardian.objects.filter(
            organization=organization,
            student=outcome.student,
            is_active=True,
        ).select_related("guardian")
        for link in links:
            recipients[link.guardian_id] = (
                link.guardian,
                link.result_email_enabled,
            )
        for recipient, email_enabled in recipients.values():
            ResultDelivery.objects.get_or_create(
                outcome=outcome,
                recipient=recipient,
                channel=ResultDelivery.PORTAL,
                defaults={"status": ResultDelivery.SENT},
            )
            if email_enabled and recipient.email:
                delivery, _ = ResultDelivery.objects.get_or_create(
                    outcome=outcome,
                    recipient=recipient,
                    channel=ResultDelivery.EMAIL,
                )
                delivery_ids.append(delivery.pk)

    if delivery_ids:
        from .tasks import send_result_publication_email

        transaction.on_commit(
            lambda: [send_result_publication_email.delay(pk) for pk in delivery_ids]
        )
    return publication


@transaction.atomic
def reopen_publication(*, publication, user):
    publication = ResultPublication.objects.select_for_update().get(pk=publication.pk)
    if publication.status != ResultPublication.PUBLISHED:
        raise ValidationError("Only the current publication can be reopened.")
    publication.status = ResultPublication.SUPERSEDED
    publication.save(update_fields=["status", "updated_at"])
    ExamMark.objects.filter(
        organization=publication.organization,
        exam__exam_type=publication.exam_type,
    ).update(
        workflow_status=ExamMark.DRAFT,
        verified_by=None,
        verified_at=None,
    )
    return publication
