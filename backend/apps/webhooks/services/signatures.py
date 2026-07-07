import hashlib
import hmac


def is_valid_signature(secret, body, signature):
    if not signature:
        return True

    digest = hmac.new(
        secret.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()

    expected = f"sha256={digest}"

    return hmac.compare_digest(
        signature,
        expected,
    ) or hmac.compare_digest(
        signature,
        digest,
    )

