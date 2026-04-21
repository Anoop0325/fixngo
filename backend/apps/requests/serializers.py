
from rest_framework import serializers
from .models import ServiceRequest, RequestStatus
from apps.accounts.serializers import UserProfileSerializer
from apps.providers.serializers import ProviderProfileSerializer


class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    
    
    user_latitude = serializers.FloatField()
    user_longitude = serializers.FloatField()

    class Meta:
        model = ServiceRequest
        fields = [
            "service_type",
            "user_latitude",
            "user_longitude",
            "user_address",
            "description",
        ]

    def validate_user_latitude(self, value):
        if not (-90 <= float(value) <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_user_longitude(self, value):
        if not (-180 <= float(value) <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value


class ServiceRequestSerializer(serializers.ModelSerializer):
    

    user = UserProfileSerializer(read_only=True)
    provider = ProviderProfileSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "user",
            "provider",
            "service_type",
            "status",
            "status_display",
            "user_latitude",
            "user_longitude",
            "user_address",
            "description",
            "is_expired",
            "created_at",
            "updated_at",
            "accepted_at",
            "completed_at",
            "expires_at",
            "user_rating",
            "user_feedback",
            "provider_rating",
            "provider_feedback",
        ]
        read_only_fields = fields


class RequestStatusUpdateSerializer(serializers.Serializer):
    

    status = serializers.ChoiceField(
        choices=[
            RequestStatus.IN_PROGRESS,
            RequestStatus.COMPLETED,
            RequestStatus.CANCELLED,
        ]
    )


class RequestRatingSerializer(serializers.Serializer):
    

    rating = serializers.IntegerField(min_value=1, max_value=5)
    feedback = serializers.CharField(required=False, allow_blank=True)

