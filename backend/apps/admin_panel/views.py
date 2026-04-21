
import logging
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView

from core.permissions import IsAdmin
from core.pagination import StandardResultsPagination
from apps.accounts.models import User
from apps.accounts.serializers import UserProfileSerializer
from apps.providers.models import ProviderProfile
from apps.providers.serializers import ProviderProfileSerializer
from apps.requests.models import ServiceRequest
from apps.requests.serializers import ServiceRequestSerializer

logger = logging.getLogger(__name__)


class AdminUserListView(ListAPIView):
    

    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserProfileSerializer
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["role", "is_active"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = ["created_at", "email"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return User.objects.all()


class AdminUserDetailView(RetrieveUpdateAPIView):
    

    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserProfileSerializer
    queryset = User.objects.all()
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        
        allowed_fields = {"is_active", "role"}
        payload = {k: v for k, v in request.data.items() if k in allowed_fields}
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"status": "success", "data": serializer.data})


class AdminProviderListView(ListAPIView):
    

    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ProviderProfileSerializer
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_available"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    ordering_fields = ["rating", "total_jobs", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return ProviderProfile.objects.select_related("user").all()


class AdminRequestListView(ListAPIView):
    

    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ServiceRequestSerializer
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "service_type"]
    search_fields = ["user__email", "provider__user__email"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return ServiceRequest.objects.select_related(
            "user", "provider__user"
        ).all()


class AdminStatsView(APIView):
    

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from apps.requests.models import RequestStatus

        stats = {
            "total_users": User.objects.filter(role="user").count(),
            "total_providers": User.objects.filter(role="provider").count(),
            "active_providers": ProviderProfile.objects.filter(is_available=True).count(),
            "total_requests": ServiceRequest.objects.count(),
            "pending_requests": ServiceRequest.objects.filter(status=RequestStatus.PENDING).count(),
            "completed_requests": ServiceRequest.objects.filter(status=RequestStatus.COMPLETED).count(),
            "cancelled_requests": ServiceRequest.objects.filter(status=RequestStatus.CANCELLED).count(),
        }
        return Response({"status": "success", "data": stats})
