from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["first_name", "last_name", "email", "phone", "role", "is_active"]
    list_filter = ["is_active", "is_staff", "is_superuser", "role"]
    search_fields = ["email", "phone", "first_name", "last_name"]
