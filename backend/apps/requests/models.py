
import uuid
from datetime import timedelta

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


class RequestStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ACCEPTED = "accepted", "Accepted"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"



VALID_TRANSITIONS = {
    RequestStatus.PENDING: [RequestStatus.ACCEPTED, RequestStatus.CANCELLED, RequestStatus.EXPIRED],
    RequestStatus.ACCEPTED: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
    RequestStatus.IN_PROGRESS: [RequestStatus.COMPLETED, RequestStatus.CANCELLED],
    RequestStatus.COMPLETED: [],  
    RequestStatus.CANCELLED: [],  
    RequestStatus.EXPIRED: [],    
}

DEFAULT_TIMEOUT_MINUTES = 15


class ServiceRequest(models.Model):
    

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.PROTECT,
        related_name="service_requests",
        db_index=True,
    )
    provider = models.ForeignKey(
        "providers.ProviderProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_requests",
    )
    service_type = models.CharField(
        max_length=20,
        choices=[
            ("mechanic", "Mechanic"),
            ("fuel", "Fuel Delivery"),
            ("towing", "Towing"),
            ("battery", "Battery Jump-start"),
            ("tyre", "Tyre Change"),
        ],
        db_index=True,
    )
    status = models.CharField(
        max_length=15,
        choices=RequestStatus.choices,
        default=RequestStatus.PENDING,
        db_index=True,
    )

    
    user_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    user_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    user_address = models.TextField(blank=True, help_text="Human-readable address if available")
    description = models.TextField(blank=True)

    
    user_rating = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating given by user to provider"
    )
    user_feedback = models.TextField(blank=True)
    
    provider_rating = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating given by provider to user"
    )
    provider_feedback = models.TextField(blank=True)

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "service_requests"
        verbose_name = "Service Request"
        verbose_name_plural = "Service Requests"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        return f"Request #{self.id} — {self.service_type} [{self.status}]"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=DEFAULT_TIMEOUT_MINUTES)
        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        return (
            self.status == RequestStatus.PENDING
            and timezone.now() > self.expires_at
        )

    def can_transition_to(self, new_status: str) -> bool:
        return new_status in VALID_TRANSITIONS.get(self.status, [])
