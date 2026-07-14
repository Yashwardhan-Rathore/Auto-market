from apps.campaigns.models import CustomerRecord , Audience
from django.db.models import Q

OPERATOR_MAP = {
    "=": "",
    "!=": "",
    "contains": "__icontains",
    "startswith": "__istartswith",
    "endswith": "__iendswith",
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

        conditions = audience_definition.get(
            "conditions",
            [],
        )

        group_operator = audience_definition.get(
            "operator",
            "AND",
        ).upper()

        query = Q()

        for condition in conditions:

            field = condition["field"]
            operator = condition["operator"]
            value = condition["value"]

            lookup = OPERATOR_MAP.get(operator)

            if lookup is None:
                raise ValueError(
                    f"Unsupported operator: {operator}"
                )

            if operator == "!=":
                condition_query = ~Q(
                    **{
                        f"data__{field}": value
                    }
                )
            else:
                condition_query = Q(
                    **{
                        f"data__{field}{lookup}": value
                    }
                )

            if group_operator == "AND":
                query &= condition_query

            elif group_operator == "OR":
                query |= condition_query

            else:
                raise ValueError(
                    "Group operator must be AND or OR."
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