
import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsProvider, IsRegularUser
from .models import ServiceRequest, RequestStatus
from .serializers import (
    ServiceRequestCreateSerializer,
    ServiceRequestSerializer,
    RequestStatusUpdateSerializer,
    RequestRatingSerializer,
)
from .services import RequestService

logger = logging.getLogger(__name__)


def success_response(data=None, message="", status_code=status.HTTP_200_OK):
    payload = {"status": "success", "message": message}
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)


class ServiceRequestListCreateView(APIView):
    

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == "provider":
            
            qs = ServiceRequest.objects.filter(
                provider__user=user
            ).select_related("user", "provider__user").order_by("-created_at")
        elif user.role == "admin":
            qs = ServiceRequest.objects.all().select_related("user", "provider__user")
        else:
            qs = ServiceRequest.objects.filter(
                user=user
            ).select_related("provider__user").order_by("-created_at")

        serializer = ServiceRequestSerializer(qs[:50], many=True)
        return success_response(data=serializer.data)

    def post(self, request):
        if request.user.role != "user":
            return Response(
                {"status": "error", "message": "Only regular users can create service requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ServiceRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        req = RequestService.create_request(request.user, serializer.validated_data)
        return success_response(
            data=ServiceRequestSerializer(req).data,
            message="Service request created.",
            status_code=status.HTTP_201_CREATED,
        )


class ServiceRequestDetailView(APIView):
    

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        req = self._get_request(pk, request.user)
        return success_response(data=ServiceRequestSerializer(req).data)

    def _get_request(self, pk, user):
        try:
            req = ServiceRequest.objects.select_related(
                "user", "provider__user"
            ).get(pk=pk)
        except ServiceRequest.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Request not found.")

        
        if user.role == "admin":
            return req
        if req.user == user:
            return req
        if (
            user.role == "provider"
            and req.provider is not None
            and req.provider.user == user
        ):
            return req
            
        
        if user.role == "provider" and req.status == "pending":
            return req
            
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("You do not have access to this request.")


class ProviderPendingRequestsView(APIView):
    

    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        from django.utils import timezone

        
        qs = ServiceRequest.objects.filter(
            status=RequestStatus.PENDING,
            expires_at__gt=timezone.now(),
            service_type__in=request.user.provider_profile.service_types
        ).select_related("user").order_by("created_at")

        serializer = ServiceRequestSerializer(qs[:30], many=True)
        return success_response(data=serializer.data)


class AcceptRequestView(APIView):
    

    permission_classes = [IsAuthenticated, IsProvider]

    def post(self, request, pk):
        provider_profile = request.user.provider_profile
        req = RequestService.accept_request(pk, provider_profile)
        return success_response(
            data=ServiceRequestSerializer(req).data,
            message="Request accepted.",
        )


class RateRequestView(APIView):
    

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        serializer = RequestRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        req = RequestService.rate_request(
            pk, 
            request.user, 
            serializer.validated_data["rating"],
            serializer.validated_data.get("feedback", "")
        )
        return success_response(
            data=ServiceRequestSerializer(req).data,
            message="Request rated successfully.",
        )


class UpdateRequestStatusView(APIView):
    

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        serializer = RequestStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        req = RequestService.update_status(pk, request.user, serializer.validated_data["status"])
        return success_response(
            data=ServiceRequestSerializer(req).data,
            message=f"Status updated to {req.status}.",
        )
