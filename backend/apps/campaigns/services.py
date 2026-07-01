import os

import pandas as pd
from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import CustomerUpload, CustomerRecord
from .utils import (
    normalize_dataframe_columns,
    remove_duplicates,
)


class CustomerImportService:
    @staticmethod
    def read_file(uploaded_file):
        """
        Read CSV or Excel file and return a pandas DataFrame.
        """

        extension = os.path.splitext(uploaded_file.name)[1].lower()

        if extension == ".csv":
            dataframe = pd.read_csv(uploaded_file)

        elif extension in [".xlsx", ".xls"]:
            dataframe = pd.read_excel(uploaded_file)

        else:
            raise ValidationError("Unsupported file format.")

        return dataframe

    @staticmethod
    def clean_dataframe(dataframe):
        """
        Normalize columns and remove duplicate records.
        """

        original_records = len(dataframe)

        dataframe = normalize_dataframe_columns(dataframe)

        dataframe, removed_duplicates = remove_duplicates(dataframe)

        return {
            "dataframe": dataframe,
            "total_records": original_records,
            "duplicates_removed": removed_duplicates,
            "records_after_cleanup": len(dataframe),
        }

    @staticmethod
    def save_upload(uploaded_file, uploaded_by, summary):
        """
        Save upload metadata.
        """

        extension = os.path.splitext(uploaded_file.name)[1].lower()

        upload = CustomerUpload.objects.create(
            original_file=uploaded_file,
            file_name=uploaded_file.name,
            file_type=extension.replace(".", ""),
            uploaded_by=uploaded_by,
            total_records=summary["total_records"],
            imported_records=summary["records_after_cleanup"],
            failed_records=0,
            status=CustomerUpload.Status.COMPLETED,
        )

        return upload

    @staticmethod
    def save_records(upload, dataframe):
        """
        Save all customer records.
        """

        records = []

        for _, row in dataframe.iterrows():
            records.append(
                CustomerRecord(
                    upload=upload,
                    data=row.to_dict(),
                )
            )

        CustomerRecord.objects.bulk_create(records)

        return len(records)

    @staticmethod
    @transaction.atomic
    def import_file(uploaded_file, uploaded_by):
        """
        Complete customer import pipeline.
        """

        dataframe = CustomerImportService.read_file(uploaded_file)

        summary = CustomerImportService.clean_dataframe(dataframe)

        upload = CustomerImportService.save_upload(
            uploaded_file=uploaded_file,
            uploaded_by=uploaded_by,
            summary=summary,
        )

        saved_records = CustomerImportService.save_records(
            upload=upload,
            dataframe=summary["dataframe"],
        )

        return {
            "message": "File uploaded successfully.",
            "upload_id": upload.id,
            "total_records": summary["total_records"],
            "duplicates_removed": summary["duplicates_removed"],
            "records_after_cleanup": summary["records_after_cleanup"],
            "saved_records": saved_records,
            "columns": summary["dataframe"].columns.tolist(),
        }