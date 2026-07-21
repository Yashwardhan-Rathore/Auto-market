from apps.campaigns.models import CustomerRecord , Audience
from django.db.models import Q

OPERATOR_MAP = {
    "=": "",
    "is": "",
    "!=": "",
    "contains": "__icontains",
    "startswith": "__istartswith",
    "endswith": "__iendswith",
    ">": "__gt",
    "greater_than": "__gt",
    "<": "__lt",
    "less_than": "__lt",
    ">=": "__gte",
    "<=": "__lte",
}

class AudienceService:

    @staticmethod
    def create_audience(
        *,
        validated_data,
        user,
    ):
        return Audience.objects.create(
            name=validated_data["name"],
            customer_upload=validated_data[
                "customer_upload"
            ],
            definition=validated_data[
                "definition"
            ],
            created_by=user,
        )

    @staticmethod
    def get_customers(
        *,
        customer_upload,
        audience_definition,
    ):
        """
        Return customers matching the supplied audience definition.
        """

        queryset = CustomerRecord.objects.filter(
            upload=customer_upload,
        )

        from apps.campaigns.utils import normalize_column_name
        def numeric_value(value):
            try:
                return float(value)
            except (TypeError, ValueError):
                return value

        def condition_query(condition):
            field = normalize_column_name(condition["field"])
            operator = str(condition.get("operator", "=")).lower()
            value = condition.get("value")
            if operator == "between":
                return Q(**{f"data__{field}__gte": numeric_value(value)}) & Q(
                    **{f"data__{field}__lte": numeric_value(condition.get("value_to"))}
                )
            lookup = OPERATOR_MAP.get(operator)
            if lookup is None:
                raise ValueError(f"Unsupported operator: {operator}")
            if operator in {">", "<", ">=", "<=", "greater_than", "less_than"}:
                value = numeric_value(value)
            query_part = Q(**{f"data__{field}{lookup}": value})
            return ~query_part if operator == "!=" else query_part

        def combine(conditions, operator="AND"):
            combined = Q()
            for condition in conditions:
                part = condition_query(condition)
                combined = combined & part if operator.upper() == "AND" else combined | part
            return combined

        groups = audience_definition.get("groups") or []
        if groups:
            query = Q()
            groups_operator = str(audience_definition.get("groups_operator", "OR")).upper()
            for group in groups:
                group_query = combine(
                    group.get("conditions", []),
                    str(group.get("operator", "AND")),
                )
                query = query & group_query if groups_operator == "AND" else query | group_query
        else:
            query = combine(
                audience_definition.get("conditions", []),
                str(audience_definition.get("operator", "AND")),
            )

        return queryset.filter(query)

    @staticmethod
    def preview_audience(
        *,
        customer_upload,
        audience_definition,
    ):
        """
        Return matching customers for the supplied audience definition.
        """

        return AudienceService.get_customers(
            customer_upload=customer_upload,
            audience_definition=audience_definition,
        )
