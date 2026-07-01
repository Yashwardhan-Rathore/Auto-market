from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import (
    Form,
    FormField,
    FormStatus,
    FormSubmission,
    SubmissionAnswer,
)


class FormService:

    @staticmethod
    @transaction.atomic
    def create_form(*, user, data):

        fields = data.pop("fields", [])

        form = Form.objects.create(
            created_by=user,
            **data,
        )

        FormField.objects.bulk_create(
            [
                FormField(
                    form=form,
                    **field,
                )
                for field in fields
            ]
        )

        return form

    @staticmethod
    @transaction.atomic
    def update_form(*, form, data):

        fields = data.pop(
            "fields",
            None,
        )

        for key, value in data.items():
            setattr(form, key, value)

        form.save()

        if fields is not None:

            form.fields.all().delete()

            FormField.objects.bulk_create(
                [
                    FormField(
                        form=form,
                        **field,
                    )
                    for field in fields
                ]
            )

        return form

    @staticmethod
    def publish_form(form):

        if not form.fields.exists():
            raise ValidationError(
                "Cannot publish an empty form."
            )

        if form.status == FormStatus.PUBLISHED:
            raise ValidationError(
                "Form is already published."
            )

        form.status = FormStatus.PUBLISHED
        form.published_at = timezone.now()

        form.save(
            update_fields=[
                "status",
                "published_at",
            ]
        )

        return form

    @staticmethod
    def archive_form(form):

        if form.status == FormStatus.ARCHIVED:
            return form

        form.status = FormStatus.ARCHIVED

        form.save(
            update_fields=[
                "status",
            ]
        )

        return form

    @staticmethod
    @transaction.atomic
    def submit_form(
        *,
        form,
        answers,
        ip_address=None,
        user_agent="",
    ):

        # submission limit
        if (
            form.submission_limit
            and form.submissions.count()
            >= form.submission_limit
        ):
            raise ValidationError(
                "Submission limit reached."
            )

        # schedule validation
        now = timezone.now()

        if (
            form.start_date
            and now < form.start_date
        ):
            raise ValidationError(
                "Form is not active yet."
            )

        if (
            form.end_date
            and now > form.end_date
        ):
            raise ValidationError(
                "Form has expired."
            )

        # validate field ownership
        valid_field_ids = set(
            form.fields.values_list(
                "id",
                flat=True,
            )
        )

        submission = FormSubmission.objects.create(
            form=form,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        submission_answers = []

        for item in answers:

            field_id = item["field_id"]

            if field_id not in valid_field_ids:
                raise ValidationError(
                    f"Invalid field id: {field_id}"
                )

            submission_answers.append(
                SubmissionAnswer(
                    submission=submission,
                    field_id=field_id,
                    answer=item["answer"],
                )
            )

        SubmissionAnswer.objects.bulk_create(
            submission_answers
        )

        return submission