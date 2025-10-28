from cryptography.fernet import Fernet

# Use a fixed key (same key every time)
# Replace this string with the one you generated above
key = b"rnDFLecaKEOy81CuW33XE5JmdWZzhRwfRhr6oFq2ngg="

fernet = Fernet(key)

def encrypt_text(text):
    """Encrypt plain text using Fernet symmetric encryption"""
    return fernet.encrypt(text.encode()).decode()

def decrypt_text(cipher):
    """Decrypt cipher text back to plain text"""
    return fernet.decrypt(cipher.encode()).decode()
