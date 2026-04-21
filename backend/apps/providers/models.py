
import uuid
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class ServiceType(models.TextChoices):
    MECHANIC = "mechanic", "Mechanic"
    FUEL = "fuel", "Fuel Delivery"
    TOWING = "towing", "Towing"
    BATTERY = "battery", "Battery Jump-start"
    TYRE = "tyre", "Tyre Change"


class ProviderProfile(models.Model):
    

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="provider_profile",
    )
    service_types = models.JSONField(default=list, blank=True)
    is_available = models.BooleanField(default=False, db_index=True)

    
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("-90.0")), MaxValueValidator(Decimal("90.0"))],
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("-180.0")), MaxValueValidator(Decimal("180.0"))],
    )

    
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_jobs = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)

    
    location_updated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "provider_profiles"
        verbose_name = "Provider Profile"
        verbose_name_plural = "Provider Profiles"
        indexes = [
            models.Index(fields=["is_available"]),
            models.Index(fields=["latitude", "longitude"]),
        ]

    def __str__(self):
        types = ", ".join(self.service_types).title() if self.service_types else "No Services"
        return f"{self.user.get_full_name()} — {types}"

    @property
    def has_location(self) -> bool:
        return self.latitude is not None and self.longitude is not None
