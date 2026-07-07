from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import User,MAUser, AccessRequest, PasswordResetOTP
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random



class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["email", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "User with this email already exists."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)

        MAUser.objects.create(
            user_id=user,
            role="USER",
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        error_messages={
            "required": "Email is required.",
            "blank": "Email is required.",
            "invalid": "Enter a valid email address.",
        },
    )

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        error_messages={
            "required": "Password is required.",
            "blank": "Password is required.",
            "min_length": "Password must be at least 8 characters long.",
        },
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            username=email,  # USERNAME_FIELD = "email"
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                {"detail": "Invalid email or password."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "Your account has been deactivated."}
            )

        attrs["user"] = user
        return attrs
    
class ProfileSerializer(serializers.ModelSerializer):

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "last_login",
            "date_joined",
            "role",
        ]
        read_only_fields = fields

    def get_role(self, obj):
        ma_user = obj.ma_users.first()
        return ma_user.role if ma_user else None



class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self):
        try:
            RefreshToken(self.token).blacklist()
        except Exception:
            raise serializers.ValidationError(
                {"detail": "Invalid or expired refresh token."}
            )
        

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "No account found with this email."
            )
        return value

    def save(self):
        user = User.objects.get(email=self.validated_data["email"])

        PasswordResetOTP.objects.filter(
            user=user,
            is_used=False,
        ).update(is_used=True)

        otp = f"{random.SystemRandom().randint(100000, 999999)}"
        PasswordResetOTP.objects.create(
            user=user,
            otp=otp,
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        subject = "Your Password Reset OTP"
        message = f"""
Hello,

You requested to reset your password.

Use this OTP to reset your password:

{otp}

This OTP will expire in 10 minutes.

If you did not request this, please ignore this email.

Thank you,
Auto Market Team
"""

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )





class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.RegexField(
        regex=r"^\d{6}$",
        error_messages={"invalid": "OTP must be a 6 digit code."},
    )
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        try:
            user = User.objects.get(email=attrs["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "No account found with this email."}
            )

        otp = PasswordResetOTP.objects.filter(
            user=user,
            otp=attrs["otp"],
            is_used=False,
        ).order_by("-created_at").first()

        if not otp:
            raise serializers.ValidationError(
                {"otp": "Invalid OTP."}
            )

        if otp.expires_at < timezone.now():
            raise serializers.ValidationError(
                {"otp": "OTP has expired."}
            )

        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                {"password": list(exc.messages)}
            )

        attrs["user"] = user
        attrs["password_reset_otp"] = otp
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save()

        otp = self.validated_data["password_reset_otp"]
        otp.is_used = True
        otp.save(update_fields=["is_used"])

class RequestAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessRequest
        fields = [
            "full_name",
            "email",
            "department",
            "designation",
            "reason",
        ]

    def validate_email(self, value):
        # Check if the user already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        # Check if an access request is already pending
        if AccessRequest.objects.filter(
            email=value,
            status="PENDING"
        ).exists():
            raise serializers.ValidationError(
                "An access request is already pending for this email."
            )

        return value

    def create(self, validated_data):
        return AccessRequest.objects.create(**validated_data)
    
class AccessRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessRequest
        fields = [
            "id",
            "full_name",
            "email",
            "department",
            "designation",
            "reason",
            "status",
            "created_at",
        ]
        read_only_fields = fields


class ApproveAccessRequestSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=[
            ("USER", "User"),
            ("ADMIN", "Admin"),
        ]
    )

class ApprovedUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    role = serializers.CharField()


class ApprovedAccessRequestSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.CharField()
    approved_by = serializers.EmailField()
    approved_at = serializers.DateTimeField()


class ApproveAccessRequestResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    user = ApprovedUserSerializer()
    access_request = ApprovedAccessRequestSerializer()

class RejectAccessRequestSerializer(serializers.Serializer):
    reason = serializers.CharField(
        max_length=500,
        trim_whitespace=True,
    )

class RejectedAccessRequestSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.CharField()
    rejection_reason = serializers.CharField()
    processed_by = serializers.EmailField()
    processed_at = serializers.DateTimeField()


class RejectAccessRequestResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    access_request = RejectedAccessRequestSerializer()



class CreateSuperAdminSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "User with this email already exists."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_superuser(
            email=validated_data["email"],
            password=validated_data["password"],
        )

        MAUser.objects.create(
            user=user,
            role="SUPER_ADMIN",
        )

        return user
