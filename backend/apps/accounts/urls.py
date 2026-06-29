from django.urls import path
from .views import RegisterView,LoginView, ProfileView , LogoutView,ForgotPasswordView,ResetPasswordView  , RequestAccessView , AccessRequestListView ,ApproveAccessRequestView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("forgot-password/",ForgotPasswordView.as_view(),name="forgot-password"),
    path("reset-password/",ResetPasswordView.as_view(),name="reset-password"),
    path("request-access/",RequestAccessView.as_view(),name="request-access"),
    path("access-requests/", AccessRequestListView.as_view(), name="access-requests"),
    path("access-requests/<int:pk>/approve/",ApproveAccessRequestView.as_view(),name="approve-access-request"),
]