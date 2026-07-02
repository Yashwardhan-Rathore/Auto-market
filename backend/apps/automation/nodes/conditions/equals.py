class EqualsCondition:

    def execute(
        self,
        execution,
        node,
        config,
    ):

        left = config.get(
            "left"
        )

        right = config.get(
            "right"
        )

        return left == right