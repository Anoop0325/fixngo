
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, UserRole




class UserRegistrationSerializer(serializers.ModelSerializer):
    

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        validators=[validate_password],
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )
    role = serializers.ChoiceField(
        choices=[UserRole.USER, UserRole.PROVIDER],
        default=UserRole.USER,
    )
    service_types = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone",
            "role",
            "service_types",
        ]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
            
        role = attrs.get("role")
        service_types = attrs.get("service_types")
        if role == UserRole.PROVIDER and not service_types:
            raise serializers.ValidationError({"service_types": "This field is required for providers."})
            
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        token["full_name"] = user.get_full_name()
        return token

    def validate(self, attrs):
        email = attrs.get("email")
        if email and not User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"detail": "User not found."})

        try:
            data = super().validate(attrs)
        except Exception:
            raise serializers.ValidationError({"detail": "Username or password is incorrect."})

        
        data["user"] = UserProfileSerializer(self.user).data
        return data




class UserProfileSerializer(serializers.ModelSerializer):
    

    full_name = serializers.CharField(source="get_full_name", read_only=True)
    service_types = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "service_types",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "email", "role", "created_at"]

    def get_service_types(self, obj):
        if obj.role == UserRole.PROVIDER and hasattr(obj, "provider_profile"):
            return obj.provider_profile.service_types
        return None


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone"]




class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, write_only=True, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "New passwords do not match."})
        return attrs
