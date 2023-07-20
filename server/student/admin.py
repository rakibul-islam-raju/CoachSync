from django.contrib import admin

from .models import Student


@admin.register(Student)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "blood_group",
        "is_active",
    ]
    list_filter = [
        "is_active",
        "blood_group",
    ]
    search_fields = [
        "user__email",
        "user__phone",
        "user__first_name",
        "user__last_name",
        "emergency_contact_no",
    ]
