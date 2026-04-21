
import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsProvider
from .models import ProviderProfile
from .serializers import (
    NearbyProviderSerializer,
    ProviderProfileSerializer,
    ProviderLocationUpdateSerializer,
    ProviderProfileUpdateSerializer,
)
from .services import ProviderMatchingService

logger = logging.getLogger(__name__)


def success_response(data=None, message="", status_code=status.HTTP_200_OK):
    payload = {"status": "success", "message": message}
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)


class NearbyProvidersView(APIView):
    

    permission_classes = [IsAuthenticated]

    def get(self, request):
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        service_type = request.query_params.get("service_type")
        radius_km = request.query_params.get("radius_km", 50)

        
        if not lat or not lon:
            return Response(
                {"status": "error", "message": "lat and lon query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            lat = float(lat)
            lon = float(lon)
            radius_km = float(radius_km)
        except ValueError:
            return Response(
                {"status": "error", "message": "lat, lon and radius_km must be valid numbers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return Response(
                {"status": "error", "message": "Invalid coordinate values."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = ProviderMatchingService.find_nearest(
            user_lat=lat,
            user_lon=lon,
            service_type=service_type,
            radius_km=min(radius_km, 200),  
        )

        serializer = NearbyProviderSerializer(results, many=True)
        return success_response(
            data=serializer.data,
            message="No providers found nearby." if not results else "",
        )


class ProviderSelfView(APIView):
    

    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        profile = self._get_profile(request.user)
        return success_response(data=ProviderProfileSerializer(profile).data)

    def patch(self, request):
        profile = self._get_profile(request.user)
        serializer = ProviderProfileUpdateSerializer(
            profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            data=ProviderProfileSerializer(profile).data,
            message="Profile updated.",
        )

    @staticmethod
    def _get_profile(user):
        try:
            return user.provider_profile
        except ProviderProfile.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Provider profile not found.")


class ProviderLocationView(APIView):
    

    permission_classes = [IsAuthenticated, IsProvider]

    def patch(self, request):
        try:
            profile = request.user.provider_profile
        except ProviderProfile.DoesNotExist:
            return Response(
                {"status": "error", "message": "Provider profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProviderLocationUpdateSerializer(
            profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(
            "Location updated for provider %s: (%.4f, %.4f)",
            request.user.email,
            float(profile.latitude or 0),
            float(profile.longitude or 0),
        )
        return success_response(message="Location updated.")
