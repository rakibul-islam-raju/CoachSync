from django_filters import rest_framework as filters

from .models import Schedule


class ScheduleFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name="date", lookup_expr="gte")
    end_date = filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Schedule
        fields = [
            "is_active",
            "subject",
            "teacher",
            "batch",
            "exam",
            "date",
            "start_date",
            "end_date",
        ]
