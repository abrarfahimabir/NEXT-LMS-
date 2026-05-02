from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class SessionJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user is None:
            return None

        session_key = validated_token.get('session_key')
        if not session_key or user.session_key != session_key:
            raise InvalidToken('Session invalid or expired.')

        return user
