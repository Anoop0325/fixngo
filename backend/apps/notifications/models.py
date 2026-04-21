
import uuid
from django.db import models


class NotificationType(models.TextChoices):
    REQUEST_RECEIVED = "request_received", "Request Received"
    STATUS_UPDATE = "status_update", "Status Update"
    REQUEST_CANCELLED = "request_cancelled", "Request Cancelled"
    REQUEST_EXPIRED = "request_expired", "Request Expired"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True,
    )
    request = models.ForeignKey(
        "requests.ServiceRequest",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.STATUS_UPDATE,
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read"]),
            models.Index(fields=["recipient", "created_at"]),
        ]

    def __str__(self):
        return f"[{self.notification_type}] → {self.recipient.email}"
