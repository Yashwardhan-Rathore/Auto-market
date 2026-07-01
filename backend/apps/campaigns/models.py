from django.db import models
from django.conf import settings

class CustomerUpload(models.Model):
    class Status(models.TextChoices):
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    file_name = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_uploads",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    total_records = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PROCESSING,
    )

    def __str__(self):
        return self.file_name


class CustomerRecord(models.Model):
    upload = models.ForeignKey(
        CustomerUpload,
        on_delete=models.CASCADE,
        related_name="records",
    )
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record {self.id}"
