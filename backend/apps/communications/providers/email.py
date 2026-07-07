from django.conf import settings
from django.core.mail import EmailMessage, get_connection


class SMTPEmailProvider:
    def __init__(self, organization_provider=None):
        self.organization_provider = organization_provider

    def send(self, subject, message, sender, recipients):
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=sender,
            to=recipients,
            connection=get_connection(),
        )
        return email.send(fail_silently=False)


class SESEmailProvider:
    def __init__(self, organization_provider):
        self.organization_provider = organization_provider

    def send(self, subject, message, sender, recipients):
        try:
            import boto3
        except ImportError as exc:
            raise RuntimeError(
                "boto3 is required for AWS SES email delivery."
            ) from exc

        client = boto3.client(
            "ses",
            aws_access_key_id=self.organization_provider.aws_access_key,
            aws_secret_access_key=self.organization_provider.aws_secret_key,
            region_name=self.organization_provider.aws_region,
        )

        return client.send_email(
            Source=sender,
            Destination={
                "ToAddresses": recipients,
            },
            Message={
                "Subject": {
                    "Data": subject,
                },
                "Body": {
                    "Text": {
                        "Data": message,
                    }
                },
            },
        )


def get_email_provider(organization):
    from apps.communications.models import OrganizationEmailProvider

    organization_provider = (
        OrganizationEmailProvider.objects.filter(
            organization=organization,
            is_active=True,
        )
        .order_by("-created_at")
        .first()
    )

    if organization_provider and organization_provider.provider == "AWS_SES":
        return SESEmailProvider(organization_provider)

    return SMTPEmailProvider(organization_provider)


def default_sender(organization_provider=None):
    if organization_provider and organization_provider.verified_domain:
        return f"no-reply@{organization_provider.verified_domain}"

    return settings.DEFAULT_FROM_EMAIL

