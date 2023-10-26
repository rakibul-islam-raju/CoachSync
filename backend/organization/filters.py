from django_filters import rest_framework as filters

from utilities.filters import MonthFilter

from .models import Schedule


class ScheduleFilter(filters.FilterSet):
    start_date = filters.DateFilter(
        field_name="date",
        lookup_expr="gte",
        help_text="Filter by month in the format YYYY-MM-DD",
    )
    end_date = filters.DateFilter(
        field_name="date",
        lookup_expr="lte",
        help_text="Filter by month in the format YYYY-MM-DD",
    )
    month = MonthFilter(
        field_name="date", help_text="Filter by month in the format YYYY-MM"
    )

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
            "month",
        ]
