from django.contrib import admin

from .models import Student, Enroll, Transaction


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
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


@admin.register(Enroll)
class EnrollAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "batch",
        "total_amount",
        "discount_amount",
    ]
    list_filter = [
        "batch",
    ]
    search_fields = [
        "student_user__email",
        "student_user__phone",
        "student_user__first_name",
        "student_user__last_name",
        "batch__name",
        "batch__code",
    ]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        "enroll",
        "amount",
        "remark",
    ]
    search_fields = [
        "enroll__student_user__email",
        "enroll__student_user__phone",
        "enroll__student_user__first_name",
        "enroll__student_user__last_name",
        "enroll__batch__name",
        "enroll__batch__code",
    ]
    date_hierarchy = "created_at"
