from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Schedule


class ScheduleFilter(filters.FilterSet):
    date_range = filters.CharFilter(method="filter_date_range")

    class Meta:
        model = Schedule
        fields = [
            "is_active",
            "subject",
            "teacher",
            "batch",
            "exam",
            "date",
        ]

    def filter_date_range(self, queryset, name, value):
        if value:
            # Split the value into start_date and end_date
            start_date, end_date = value.split(",")

            # Create a Q object for filtering
            date_filter = Q()

            if start_date:
                date_filter &= Q(
                    **{
                        f"{name}__date__gte": start_date,
                    }
                )

            if end_date:
                date_filter &= Q(
                    **{
                        f"{name}__date__lte": end_date,
                    }
                )

            # Apply the date filter to the queryset
            queryset = queryset.filter(date_filter)

        return queryset
