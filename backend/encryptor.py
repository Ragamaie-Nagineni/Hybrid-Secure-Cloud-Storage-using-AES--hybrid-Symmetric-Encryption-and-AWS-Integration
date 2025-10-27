from cryptography.fernet import Fernet

# You can save this key securely (e.g., in AWS Secrets Manager)
# For demo purposes, a fixed key is okay
key = Fernet.generate_key()
fernet = Fernet(key)

def encrypt_text(text):
    """Encrypt plain text using Fernet symmetric encryption"""
    return fernet.encrypt(text.encode()).decode()

def decrypt_text(cipher):
    """Decrypt cipher text back to plain text"""
    return fernet.decrypt(cipher.encode()).decode()
