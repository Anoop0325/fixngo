
from django.contrib import admin
from .models import ProviderProfile


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "service_types", "is_available", "rating", "total_jobs", "has_location"]
    list_filter = ["is_available"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    readonly_fields = ["id", "rating", "total_jobs", "created_at", "updated_at", "location_updated_at"]

    def has_location(self, obj):
        return obj.has_location
    has_location.boolean = True
