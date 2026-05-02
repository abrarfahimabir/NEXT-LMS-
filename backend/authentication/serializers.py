from uuid import uuid4

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    enrolled_courses_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "avatar_url",
            "bio",
            "expertise",
            "email_verified",
            "enrolled_courses_count",
        ]
        read_only_fields = ["email_verified", "enrolled_courses_count"]

    def get_enrolled_courses_count(self, obj):
        if obj.role != User.ROLE_STUDENT:
            return 0
        return obj.enrollments.count()


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for admin user management"""
    enrolled_courses_count = serializers.SerializerMethodField()
    courses_created_count = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "avatar_url",
            "bio",
            "expertise",
            "email_verified",
            "enrolled_courses_count",
            "courses_created_count",
            "date_joined",
        ]
        read_only_fields = ["email_verified", "date_joined"]

    def get_enrolled_courses_count(self, obj):
        if obj.role != User.ROLE_STUDENT:
            return 0
        return obj.enrollments.count()
    
    def get_courses_created_count(self, obj):
        if obj.role not in [User.ROLE_INSTRUCTOR, User.ROLE_ADMIN]:
            return 0
        return obj.courses.count()


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin to create users"""
    password = serializers.CharField(write_only=True, required=True)
    enrolled_courses_count = serializers.IntegerField(read_only=True)
    courses_created_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "bio",
            "expertise",
            "enrolled_courses_count",
            "courses_created_count",
        ]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "avatar_url",
            "bio",
        ]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        # Always assign student role to self-registering users
        validated_data["role"] = User.ROLE_STUDENT
        return User.objects.create_user(**validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context["request"].user)
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.session_key = None
        user.save(update_fields=["password", "session_key"])
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        session_key = uuid4().hex
        
        # Add claims to refresh token
        token["session_key"] = session_key
        token["role"] = user.role
        token["username"] = user.username
        
        # Add claims to access token
        token.access_token["session_key"] = session_key
        token.access_token["role"] = user.role
        token.access_token["username"] = user.username
        
        user.session_key = session_key
        user.save(update_fields=["session_key"])
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["session_key"] = self.user.session_key
        data["user"] = UserSerializer(self.user).data
        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    @staticmethod
    def get_token(user):
        refresh = RefreshToken.for_user(user)
        
        # Add claims to refresh token
        refresh["session_key"] = user.session_key
        refresh["role"] = user.role
        refresh["username"] = user.username
        
        # Add claims to access token
        refresh.access_token["session_key"] = user.session_key
        refresh.access_token["role"] = user.role
        refresh.access_token["username"] = user.username
        
        return refresh

    def validate(self, attrs):
        try:
            refresh = RefreshToken(attrs["refresh"])
        except Exception as exc:
            raise InvalidToken("Refresh token is invalid or expired.") from exc

        user = User.objects.filter(pk=refresh["user_id"]).first()
        if user is None or user.session_key != refresh.get("session_key"):
            raise InvalidToken("Session invalid or expired. Please log in again.")

        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    refresh.blacklist()
                except AttributeError:
                    pass
            refresh = self.get_token(user)
            data = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        else:
            # If not rotating, we still need to make sure the access token has the session_key
            # We can either use the existing one if it had it, or generate a new one from the refresh token
            # But the refresh token already has it in its payload, so refresh.access_token 
            # might not have it unless we explicitly add it.
            access_token = refresh.access_token
            access_token["session_key"] = user.session_key
            access_token["role"] = user.role
            access_token["username"] = user.username
            data = {"access": str(access_token)}

        data["user"] = UserSerializer(user).data
        return data
