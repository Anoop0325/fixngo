
import logging
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound

from .models import ServiceRequest, RequestStatus

logger = logging.getLogger(__name__)


class RequestService:

    @staticmethod
    @transaction.atomic
    def create_request(user, validated_data: dict) -> ServiceRequest:
        
        
        active_exists = ServiceRequest.objects.filter(
            user=user,
            status__in=[RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS],
        ).exists()

        if active_exists:
            raise ValidationError(
                {"detail": "You already have an active service request. Complete or cancel it first."}
            )

        request = ServiceRequest.objects.create(user=user, **validated_data)
        logger.info("Request created: %s by user %s", request.id, user.email)
        return request

    @staticmethod
    @transaction.atomic
    def accept_request(request_id: str, provider_profile) -> ServiceRequest:
        
        try:
            request = (
                ServiceRequest.objects.select_for_update()
                .get(id=request_id)
            )
        except ServiceRequest.DoesNotExist:
            raise NotFound("Service request not found.")

        
        if request.is_expired:
            request.status = RequestStatus.EXPIRED
            request.save(update_fields=["status", "updated_at"])
            raise ValidationError({"detail": "This request has expired."})

        if not request.can_transition_to(RequestStatus.ACCEPTED):
            raise ValidationError(
                {"detail": f"Cannot accept a request in '{request.status}' state."}
            )

        request.provider = provider_profile
        request.status = RequestStatus.ACCEPTED
        request.accepted_at = timezone.now()
        request.save(update_fields=["provider", "status", "accepted_at", "updated_at"])

        logger.info("Request %s accepted by provider %s", request.id, provider_profile.user.email)

        
        RequestService._notify(
            recipient=request.user,
            request=request,
            notification_type="status_update",
            message=f"Your request has been accepted by {provider_profile.user.get_full_name()}.",
        )

        return request

    @staticmethod
    @transaction.atomic
    def update_status(request_id: str, actor, new_status: str) -> ServiceRequest:
        
        try:
            request = ServiceRequest.objects.select_for_update().get(id=request_id)
        except ServiceRequest.DoesNotExist:
            raise NotFound("Service request not found.")

        
        is_admin = actor.role == "admin"
        is_assigned_provider = (
            request.provider is not None
            and hasattr(actor, "provider_profile")
            and request.provider == actor.provider_profile
        )
        is_owner = request.user == actor

        if new_status == RequestStatus.CANCELLED:
            if not (is_owner or is_assigned_provider or is_admin):
                raise PermissionDenied("You are not authorised to cancel this request.")
        else:
            if not (is_assigned_provider or is_admin):
                raise PermissionDenied("Only the assigned provider can update this status.")

        if not request.can_transition_to(new_status):
            raise ValidationError(
                {"detail": f"Invalid transition: {request.status} → {new_status}."}
            )

        request.status = new_status
        if new_status == RequestStatus.COMPLETED:
            request.completed_at = timezone.now()
            
            if request.provider:
                request.provider.total_jobs += 1
                request.provider.save(update_fields=["total_jobs", "updated_at"])

        request.save(update_fields=["status", "completed_at", "updated_at"])
        logger.info("Request %s transitioned to %s by %s", request.id, new_status, actor.email)

        
        recipient = request.user if new_status != RequestStatus.CANCELLED else None
        if recipient and recipient != actor:
            RequestService._notify(
                recipient=recipient,
                request=request,
                notification_type="status_update",
                message=f"Your request status has been updated to: {new_status.replace('_', ' ').title()}.",
            )

        return request

    @staticmethod
    @transaction.atomic
    def rate_request(request_id: str, actor, rating: int, feedback: str) -> ServiceRequest:
        try:
            req = ServiceRequest.objects.select_for_update().get(id=request_id)
        except ServiceRequest.DoesNotExist:
            raise NotFound("Service request not found.")

        if req.status != RequestStatus.COMPLETED:
            raise ValidationError({"detail": "Only completed requests can be rated."})

        
        is_owner = req.user == actor
        is_assigned_provider = (
            req.provider is not None
            and hasattr(actor, "provider_profile")
            and req.provider == actor.provider_profile
        )

        if not (is_owner or is_assigned_provider):
            raise PermissionDenied("You are not authorised to rate this request.")

        if is_owner:
            if req.user_rating:
                raise ValidationError({"detail": "You have already rated this service."})
            req.user_rating = rating
            req.user_feedback = feedback
            
            
            if req.provider:
                provider = req.provider
                
                current_total = provider.rating * provider.total_jobs
                
                
                
                from django.db.models import Avg
                req.save(update_fields=["user_rating", "user_feedback"])
                
                avg = ServiceRequest.objects.filter(
                    provider=provider, user_rating__isnull=False
                ).aggregate(Avg('user_rating'))['user_rating__avg']
                
                provider.rating = round(avg, 2) if avg is not None else 0.0
                provider.save(update_fields=["rating"])
                
                return req
                
        elif is_assigned_provider:
            if req.provider_rating:
                raise ValidationError({"detail": "You have already rated this user."})
            req.provider_rating = rating
            req.provider_feedback = feedback
            req.save(update_fields=["provider_rating", "provider_feedback"])

        return req

    @staticmethod
    def _notify(recipient, request, notification_type: str, message: str):
        
        try:
            from apps.notifications.models import Notification
            Notification.objects.create(
                recipient=recipient,
                request=request,
                notification_type=notification_type,
                message=message,
            )
        except Exception as exc:
            logger.warning("Failed to create notification: %s", exc)
