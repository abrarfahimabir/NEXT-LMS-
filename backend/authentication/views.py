from django.db import models
from django.db.models import Count
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .serializers import (
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    CustomTokenRefreshSerializer,
    RegisterSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserDetailSerializer,
)


class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.ROLE_ADMIN


class UserListView(generics.ListAPIView):
    """List all users - Admin only"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserDetailSerializer
    permission_classes = (IsAdminUser,)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        
        if role:
            queryset = queryset.filter(role=role)
        if search:
            queryset = queryset.filter(
                models.Q(username__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search)
            )
        return queryset


class UserCreateView(generics.CreateAPIView):
    """Create new user - Admin only"""
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = (IsAdminUser,)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific user - Admin only"""
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = (IsAdminUser,)


class ChangeUserRoleView(APIView):
    """Change user's role - Admin only"""
    permission_classes = (IsAdminUser,)

    def post(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        new_role = request.data.get('role')
        if new_role not in [User.ROLE_ADMIN, User.ROLE_INSTRUCTOR, User.ROLE_STUDENT]:
            return Response(
                {"error": "Invalid role. Must be admin, instructor, or student."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent removing own admin role
        if request.user.id == user.id and user.role == User.ROLE_ADMIN and new_role != User.ROLE_ADMIN:
            return Response(
                {"error": "Cannot remove your own admin role."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.role = new_role
        user.save()

        return Response({
            "message": f"User role changed to {new_role}.",
            "user": UserDetailSerializer(user).data
        })


class UploadAvatarView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if "avatar" not in request.FILES:
            return Response(
                {"error": "No avatar file provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        avatar_file = request.FILES["avatar"]
        user = request.user

        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if avatar_file.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {"error": "File too large. Maximum size is 5MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete old avatar if exists
        if user.avatar_url:
            user.avatar_url.delete(save=True)

        user.avatar_url = avatar_file
        user.save()

        return Response({
            "message": "Avatar uploaded successfully.",
            "avatar_url": user.avatar_url.url if user.avatar_url else None
        })


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    authentication_classes = ()
    serializer_class = RegisterSerializer


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    authentication_classes = ()
    serializer_class = CustomTokenObtainPairSerializer


class RefreshTokenView(TokenRefreshView):
    permission_classes = (AllowAny,)
    authentication_classes = ()
    serializer_class = CustomTokenRefreshSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password updated successfully. Please log in again."},
            status=status.HTTP_200_OK,
        )
