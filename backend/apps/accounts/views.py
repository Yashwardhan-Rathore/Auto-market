from rest_framework import generics, status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User , AccessRequest
from .serializers import LoginSerializer, RegisterSerializer , ProfileSerializer , LogoutSerializer,ForgotPasswordSerializer,ResetPasswordSerializer , RequestAccessSerializer , AccessRequestSerializer , ApproveAccessRequestSerializer , ApproveAccessRequestResponseSerializer ,    RejectAccessRequestSerializer,RejectAccessRequestResponseSerializer
from django.utils import timezone
from .permissions import IsAdminOrSuperAdmin
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import approve_access_request,reject_access_request


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

        
        refresh = RefreshToken.for_user(user)

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
                        "role": user.role,
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
    
class RequestAccessView(generics.CreateAPIView):
    serializer_class = RequestAccessSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "success": True,
                "message": (
                    "Your access request has been submitted successfully. "
                    "Please wait for administrator approval."
                ),
            },
            status=status.HTTP_201_CREATED,
        )
    
class AccessRequestListView(generics.ListAPIView):
    serializer_class = AccessRequestSerializer
    permission_classes = [IsAdminOrSuperAdmin]

    def get_queryset(self):
        return AccessRequest.objects.filter(
            status="PENDING"
        ).order_by("-created_at")
    
class ApproveAccessRequestView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, pk):
        serializer = ApproveAccessRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = approve_access_request(
            request_id=pk,
            role=serializer.validated_data["role"],
            approved_by=request.user,
        )

        response_data = {
            "message": "Access request approved successfully.",
            "user": {
                "id": result["user"].id,
                "email": result["user"].email,
                "role": result["user"].role,
            },
            "access_request": {
                "id": result["access_request"].id,
                "status": result["access_request"].status,
                "approved_by": request.user.email,
                "approved_at": result["access_request"].approved_at,
            },
        }

        response_serializer = ApproveAccessRequestResponseSerializer(
            response_data
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )

class RejectAccessRequestView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, pk):
        serializer = RejectAccessRequestSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        access_request = reject_access_request(
            request_id=pk,
            reason=serializer.validated_data["reason"],
            rejected_by=request.user,
        )

        response_data = {
            "message": "Access request rejected successfully.",
            "access_request": {
                "id": access_request.id,
                "status": access_request.status,
                "rejection_reason": access_request.rejection_reason,
                "processed_by": request.user.email,
                "processed_at": access_request.approved_at,
            },
        }

        response_serializer = RejectAccessRequestResponseSerializer(
            response_data
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )
