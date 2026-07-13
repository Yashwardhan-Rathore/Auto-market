from rest_framework import generics, status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, MAUser
from .serializers import LoginSerializer, RegisterSerializer, ProfileSerializer, LogoutSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, CreateSuperAdminSerializer
from django.utils import timezone
from .permissions import IsAdminOrSuperAdmin
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TeamMemberCreateSerializer

class TeamMemberCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = TeamMemberCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "success": True,
                "message": "Team member created successfully.",
                "data": {
                    "id": user.id,
                    "email": user.email,
                }
            },
            status=status.HTTP_201_CREATED
        )


class UserListAPIView(generics.ListAPIView):
    permission_classes = [IsAdminOrSuperAdmin]
    
    def get_queryset(self):
        user = self.request.user
        ma = user.ma_users.first()
        qs = User.objects.filter(is_active=True, company=user.company)
        
        if ma and ma.role == "SUPER_ADMIN":
            # Super Admin only sees Admins in the same company
            return qs.filter(ma_users__role="ADMIN").order_by("email")
        elif ma and ma.role == "ADMIN":
            # Admin only sees Users they manage
            return qs.filter(ma_users__managed_by=ma).order_by("email")
            
        return User.objects.none()
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = [
            {
                "id": u.id,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
            }
            for u in queryset
        ]
        return Response(data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

       
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        ma_user = MAUser.objects.filter(user_id=user).first()
        refresh = RefreshToken.for_user(user)

        role = ma_user.role if ma_user else ("SUPER_ADMIN" if user.is_superuser else "USER")

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "role": role,
                        "is_active": user.is_active,
                        "last_login": user.last_login,
                    },
                },
            },
            status=status.HTTP_200_OK,
        )
    
class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    

class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "success": True,
                "message": "Logout successful."
            },
            status=status.HTTP_200_OK,
        )
    
class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "success": True,
                "message": "Password reset OTP has been sent to your email."
            },
            status=status.HTTP_200_OK,
        )
    
class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "success": True,
                "message": "Password reset successfully."
            },
            status=status.HTTP_200_OK,
        )
    

# accounts/views.py

class CreateSuperAdminView(generics.CreateAPIView):
    serializer_class = CreateSuperAdminSerializer
    permission_classes = [AllowAny]   # Change later

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "success": True,
                "message": "Super Admin created successfully.",
                "data": {
                    "id": user.id,
                    "email": user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )
