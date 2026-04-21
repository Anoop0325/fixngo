
import logging
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
)
from .services import AuthService
from .throttling import LoginRateThrottle, RegisterRateThrottle

logger = logging.getLogger(__name__)


def success_response(data=None, message="", status_code=status.HTTP_200_OK):
    
    payload = {"status": "success", "message": message}
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)




class RegisterView(APIView):
    

    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = AuthService.register_user(serializer.validated_data)
        
        refresh = RefreshToken.for_user(user)

        return success_response(
            data={
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            message="Account created successfully.",
            status_code=status.HTTP_201_CREATED,
        )




class LoginView(TokenObtainPairView):
    

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            response.data = {
                "status": "success",
                "message": "Login successful.",
                "data": response.data,
            }
        return response




class TokenRefreshView(TokenRefreshView):
    
    pass




class LogoutView(APIView):
    

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"status": "error", "message": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as exc:
            logger.warning("Logout with invalid token: %s", exc)
            return Response(
                {"status": "error", "message": "Invalid or already expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(message="Logged out successfully.")




class ProfileView(APIView):
    

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return success_response(data=serializer.data)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        
        service_types = request.data.get("service_types")
        if request.user.role == "provider" and service_types is not None:
            if isinstance(service_types, list):
                request.user.provider_profile.service_types = service_types
                request.user.provider_profile.save(update_fields=["service_types"])

        return success_response(
            data=UserProfileSerializer(request.user).data,
            message="Profile updated.",
        )




class ChangePasswordView(APIView):
    

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.change_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
        )
        return success_response(message="Password changed successfully.")
