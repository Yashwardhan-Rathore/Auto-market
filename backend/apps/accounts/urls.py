from django.urls import path
from .views import RegisterView,LoginView, ProfileView , LogoutView,ForgotPasswordView,ResetPasswordView  , CreateSuperAdminView , CreateAdminView , CreateUserView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("forgot-password/",ForgotPasswordView.as_view(),name="forgot-password"),
    path("reset-password/",ResetPasswordView.as_view(),name="reset-password"),
    path(
    "create-super-admin/",
    CreateSuperAdminView.as_view(),
    name="create-super-admin"),
    path(
    "admins/",
    CreateAdminView.as_view(),
    name="create-admin"),
    path(
    "users/",
    CreateUserView.as_view(),
    name="create-user"),
]