import uuid
from django.db import models

class TimeStampedUUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Company(TimeStampedUUIDModel):
    name = models.CharField(max_length=255, db_index=True)
    subdomain = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "companies"
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name


class Department(TimeStampedUUIDModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="departments")
    name = models.CharField(max_length=255, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "departments"
        unique_together = [("company", "name")]

    def __str__(self):
        return f"{self.name} ({self.company.name})"
