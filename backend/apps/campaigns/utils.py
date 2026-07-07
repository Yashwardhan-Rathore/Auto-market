import re


COLUMN_MAPPING = {
    # Name
    "name": "name",
    "customer name": "name",
    "full name": "name",

    # Email
    "email": "email",
    "email address": "email",
    "mail": "email",

    # Phone
    "phone": "phone",
    "mobile": "phone",
    "mobile number": "phone",
    "contact": "phone",

    # City
    "city": "city",
    "location": "city",
    "town": "city",
}

def normalize_column_name(column_name):
    """
    Normalize a single column name.
    """

    # Remove leading/trailing spaces
    column_name = column_name.strip().lower()

    # Replace multiple spaces with single space
    column_name = re.sub(r"\s+", " ", column_name)

    # Check if we have a predefined mapping
    if column_name in COLUMN_MAPPING:
        return COLUMN_MAPPING[column_name]

    # Default behavior:
    # Vehicle Type -> vehicle_type
    return column_name.replace(" ", "_")

def normalize_dataframe_columns(dataframe):
    """
    Normalize all DataFrame column names.
    """

    dataframe = dataframe.rename(
        columns={
            column: normalize_column_name(column)
            for column in dataframe.columns
        }
    )

    return dataframe

def remove_duplicates(dataframe):
    """
    Remove duplicate customer records.

    Priority:
    1. Email
    2. Phone
    3. Entire row
    """

    original_count = len(dataframe)

    # Replace NaN with empty string
    dataframe = dataframe.fillna("")

    # Remove duplicate emails
    if "email" in dataframe.columns:
        dataframe = dataframe[
            (dataframe["email"] == "")
            | (~dataframe["email"].duplicated())
        ]

    # Remove duplicate phone numbers
    if "phone" in dataframe.columns:
        dataframe = dataframe[
            (dataframe["phone"] == "")
            | (~dataframe["phone"].duplicated())
        ]

    # Remove exact duplicate rows
    dataframe = dataframe.drop_duplicates()

    removed = original_count - len(dataframe)

    return dataframe, removed