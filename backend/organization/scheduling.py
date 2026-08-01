from datetime import datetime, timedelta

from django.db.models import Q
from rest_framework.exceptions import ValidationError

from .models import Schedule


def _interval(item):
    start = datetime.combine(item["date"], item["time"])
    return start, start + timedelta(minutes=item["duration"])


def _overlaps(left, right):
    left_start, left_end = _interval(left)
    right_start, right_end = _interval(right)
    return left_start < right_end and right_start < left_end


def validate_schedule_conflicts(items, organization, *, instances=None):
    """Reject batch or teacher interval collisions as one atomic batch."""

    instances = instances or [None] * len(items)
    errors = [{} for _ in items]

    for index, item in enumerate(items):
        for other_index in range(index):
            other = items[other_index]
            same_batch = item["batch"].pk == other["batch"].pk
            same_teacher = (
                item.get("teacher") is not None
                and other.get("teacher") is not None
                and item["teacher"].pk == other["teacher"].pk
            )
            if (same_batch or same_teacher) and _overlaps(item, other):
                message = "Overlaps another schedule in this request."
                errors[index]["non_field_errors"] = [message]
                errors[other_index]["non_field_errors"] = [message]

        query = Q(batch=item["batch"])
        if item.get("teacher"):
            query |= Q(teacher=item["teacher"])
        persisted = Schedule.objects.filter(
            organization=organization,
            date=item["date"],
            is_active=True,
        ).filter(query)
        instance = instances[index]
        if instance:
            persisted = persisted.exclude(pk=instance.pk)
        for existing in persisted:
            existing_data = {
                "date": existing.date,
                "time": existing.time,
                "duration": existing.duration,
            }
            if _overlaps(item, existing_data):
                errors[index]["non_field_errors"] = [
                    f"Overlaps existing schedule #{existing.pk}."
                ]
                break

    if any(errors):
        raise ValidationError(errors)
