from datetime import datetime


def resolve_value(config, key, execution):
    value = config.get(key)

    if isinstance(value, dict) and "path" in value:
        return resolve_path(execution.context, value["path"])

    if isinstance(value, str) and value.startswith("$."):
        return resolve_path(execution.context, value[2:])

    return value


def resolve_path(data, path):
    current = data or {}

    for part in path.split("."):
        if isinstance(current, dict):
            current = current.get(part)
        else:
            return None

    return current


def parse_datetime(value):
    if isinstance(value, datetime):
        return value

    if not value:
        return None

    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
