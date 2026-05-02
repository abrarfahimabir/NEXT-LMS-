from django.urls import path

from .views import (
    ChangePasswordView,
    ChangeUserRoleView,
    LoginView,
    ProfileView,
    RefreshTokenView,
    RegisterView,
    UploadAvatarView,
    UserCreateView,
    UserDetailView,
    UserListView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("upload-avatar/", UploadAvatarView.as_view(), name="upload_avatar"),
    # Admin user management
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/create/", UserCreateView.as_view(), name="user-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("users/<int:user_id>/change-role/", ChangeUserRoleView.as_view(), name="change-user-role"),
]
