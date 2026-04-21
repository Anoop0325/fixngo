
from django.contrib import admin
from .models import ServiceRequest


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "service_type", "status", "provider", "created_at", "expires_at"]
    list_filter = ["status", "service_type", "created_at"]
    search_fields = ["user__email", "user__first_name", "provider__user__email"]
    readonly_fields = ["id", "created_at", "updated_at", "accepted_at", "completed_at", "expires_at"]
    ordering = ["-created_at"]
