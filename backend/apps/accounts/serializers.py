from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User, AccessRequest
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str



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
        return User.objects.create_user(**validated_data)


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
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "role",
            "is_active",
            "last_login",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields



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

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)

        reset_link = (
            f"http://localhost:3000/reset-password/{uid}/{token}/"
        )

        subject = "Reset Your Password"

        message = f"""
Hello,

You requested to reset your password.

Click the link below to reset your password:

{reset_link}

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
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError(
                {"detail": "Invalid reset link."}
            )

        if not PasswordResetTokenGenerator().check_token(
            user, attrs["token"]
        ):
            raise serializers.ValidationError(
                {"detail": "Invalid or expired token."}
            )

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save()

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