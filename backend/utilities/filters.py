from django_filters import rest_framework as filters


class MonthFilter(filters.CharFilter):
    def filter(self, queryset, value, *args, **kwargs):
        if value is not None:
            try:
                year, month = map(int, value.split("-"))
                queryset = queryset.filter(date__year=year, date__month=month)
            except ValueError:
                pass
        return queryset

    class Meta:
        help_text = "Filter by month in the format YYYY-MM"
