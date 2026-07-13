from django.urls import path
from .views import RegisterView,LoginView, ProfileView , LogoutView,ForgotPasswordView,ResetPasswordView, CreateSuperAdminView, UserListAPIView, TeamMemberCreateAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("users/", UserListAPIView.as_view(), name="users"),
    path("team/create/", TeamMemberCreateAPIView.as_view(), name="team-create"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("forgot-password/",ForgotPasswordView.as_view(),name="forgot-password"),
    path("reset-password/",ResetPasswordView.as_view(),name="reset-password"),
    path("create-super-admin/",CreateSuperAdminView.as_view(),name="create-super-admin"),
]