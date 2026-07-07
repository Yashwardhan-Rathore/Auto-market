from .base import resolve_value


class EqualsCondition:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        left = resolve_value(
            config,
            "left",
            execution,
        )

        right = resolve_value(
            config,
            "right",
            execution,
        )

        return left == right
