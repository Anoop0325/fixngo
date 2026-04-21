
import logging
from django.db import transaction
from rest_framework.exceptions import ValidationError, AuthenticationFailed

from .models import User, UserRole

logger = logging.getLogger(__name__)


class AuthService:
    

    @staticmethod
    @transaction.atomic
    def register_user(validated_data: dict) -> User:
        
        password = validated_data.pop("password")
        service_types = validated_data.pop("service_types", [])

        try:
            user = User.objects.create_user(password=password, **validated_data)
        except Exception as exc:
            logger.error("User registration failed: %s", exc)
            raise ValidationError({"detail": "Registration failed. Please try again."}) from exc

        logger.info("New user registered: %s (role=%s)", user.email, user.role)

        
        if user.role == UserRole.PROVIDER:
            from apps.providers.models import ProviderProfile
            ProviderProfile.objects.create(user=user, service_types=service_types)
            logger.info("ProviderProfile created for user: %s", user.email)

        return user

    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> None:
        
        if not user.check_password(old_password):
            raise AuthenticationFailed("Current password is incorrect.")
        user.set_password(new_password)
        user.save(update_fields=["password", "updated_at"])
        logger.info("Password changed for user: %s", user.email)
