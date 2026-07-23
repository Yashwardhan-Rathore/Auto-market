import base64
import hashlib
from cryptography.fernet import Fernet
from django.conf import settings

def get_cipher():
    """
    Returns a Fernet cipher instance using a deterministic 32-byte url-safe base64 key
    derived from Django's SECRET_KEY.
    """
    secret = settings.SECRET_KEY.encode('utf-8')
    # Hash the secret key to get exactly 32 bytes
    hashed_secret = hashlib.sha256(secret).digest()
    key = base64.urlsafe_b64encode(hashed_secret)
    return Fernet(key)

def encrypt_token(token: str) -> str:
    """Encrypts a string token and returns it as a string."""
    if not token:
        return ""
    cipher = get_cipher()
    encrypted_bytes = cipher.encrypt(token.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')

def decrypt_token(encrypted_token: str) -> str:
    """Decrypts a string token and returns the original string."""
    if not encrypted_token:
        return ""
    cipher = get_cipher()
    decrypted_bytes = cipher.decrypt(encrypted_token.encode('utf-8'))
    return decrypted_bytes.decode('utf-8')
