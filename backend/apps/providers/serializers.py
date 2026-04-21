
from rest_framework import serializers
from .models import ProviderProfile, ServiceType
from apps.accounts.serializers import UserProfileSerializer


class ProviderProfileSerializer(serializers.ModelSerializer):
    

    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            "id",
            "user",
            "service_types",
            "is_available",
            "latitude",
            "longitude",
            "rating",
            "total_jobs",
            "bio",
            "location_updated_at",
            "created_at",
        ]
        read_only_fields = ["id", "rating", "total_jobs", "created_at"]


class NearbyProviderSerializer(serializers.Serializer):
    

    id = serializers.UUIDField(source="provider.id")
    full_name = serializers.CharField(source="provider.user.get_full_name")
    service_types = serializers.JSONField(source="provider.service_types")
    rating = serializers.DecimalField(source="provider.rating", max_digits=3, decimal_places=2)
    total_jobs = serializers.IntegerField(source="provider.total_jobs")
    latitude = serializers.DecimalField(source="provider.latitude", max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(source="provider.longitude", max_digits=9, decimal_places=6)
    distance_km = serializers.FloatField()
    phone = serializers.CharField(source="provider.user.phone")


class ProviderLocationUpdateSerializer(serializers.ModelSerializer):
    
    
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)

    class Meta:
        model = ProviderProfile
        fields = ["latitude", "longitude", "is_available"]

    def validate(self, attrs):
        lat = attrs.get("latitude")
        lon = attrs.get("longitude")
        if lat is not None and (lat < -90 or lat > 90):
            raise serializers.ValidationError({"latitude": "Must be between -90 and 90."})
        if lon is not None and (lon < -180 or lon > 180):
            raise serializers.ValidationError({"longitude": "Must be between -180 and 180."})
        return attrs

    def update(self, instance, validated_data):
        from django.utils import timezone
        if "latitude" in validated_data or "longitude" in validated_data:
            validated_data["location_updated_at"] = timezone.now()
        return super().update(instance, validated_data)


class ProviderProfileUpdateSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = ProviderProfile
        fields = ["service_types", "bio", "is_available"]
