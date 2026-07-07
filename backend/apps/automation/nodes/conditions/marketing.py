from .base import parse_datetime, resolve_value


class NotEqualsCondition:
    def execute(self, execution, node, config):
        return (
            resolve_value(config, "left", execution)
            != resolve_value(config, "right", execution)
        )


class ContainsCondition:
    def execute(self, execution, node, config):
        left = resolve_value(config, "left", execution)
        right = resolve_value(config, "right", execution)

        if left is None:
            return False

        return str(right) in str(left)


class NotContainsCondition:
    def execute(self, execution, node, config):
        return not ContainsCondition().execute(
            execution,
            node,
            config,
        )


class ExistsCondition:
    def execute(self, execution, node, config):
        return resolve_value(config, "left", execution) is not None


class EmptyCondition:
    def execute(self, execution, node, config):
        value = resolve_value(config, "left", execution)
        return value in (None, "", [], {})


class BooleanCompareCondition:
    def execute(self, execution, node, config):
        left = bool(resolve_value(config, "left", execution))
        right = bool(resolve_value(config, "right", execution))
        operator = (config.get("operator") or "EQUALS").upper()

        if operator == "NOT_EQUALS":
            return left != right

        return left == right


class DateCompareCondition:
    def execute(self, execution, node, config):
        left = parse_datetime(resolve_value(config, "left", execution))
        right = parse_datetime(resolve_value(config, "right", execution))
        operator = (config.get("operator") or "EQUALS").upper()

        if not left or not right:
            return False

        if operator == "BEFORE":
            return left < right

        if operator == "AFTER":
            return left > right

        if operator == "ON_OR_BEFORE":
            return left <= right

        if operator == "ON_OR_AFTER":
            return left >= right

        return left == right


class AndCondition:
    def execute(self, execution, node, config):
        conditions = config.get("conditions", [])
        return all(bool(item.get("value")) for item in conditions)


class OrCondition:
    def execute(self, execution, node, config):
        conditions = config.get("conditions", [])
        return any(bool(item.get("value")) for item in conditions)


class NotCondition:
    def execute(self, execution, node, config):
        return not bool(resolve_value(config, "left", execution))
