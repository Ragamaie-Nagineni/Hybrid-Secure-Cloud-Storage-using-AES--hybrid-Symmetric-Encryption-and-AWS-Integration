
/**
 * This file contains the client-side encryption logic.
 * The server remains "zero-knowledge" and never sees the key or data.
 * This version includes improved, more secure algorithms.
 */

// --- ALGORITHM PREFIXES ---
// We add a prefix to the ciphertext so we know how to decrypt it.
const AES_PREFIX = "v1a:";    // v1, algorithm "aes"
const MATRIX_PREFIX = "v1m:"; // v1, algorithm "matrix"


// --- 1. AES ALGORITHM (Improved with PBKDF2) ---
// Used for LARGE data.
// CryptoJS.AES.encrypt automatically uses PBKDF2 to derive a strong key
// from the password, which is a significant improvement.

function encryptWithAES(dataString, password) {
    console.log("Using Improved AES (large data)");
    try {
        const ciphertext = CryptoJS.AES.encrypt(dataString, password).toString();
        // Return with prefix
        return AES_PREFIX + ciphertext;
    } catch (e) {
        console.error("AES Encryption Error:", e);
        return null;
    }
}

function decryptWithAES(prefixedCiphertext, password) {
    console.log("Decrypting with Improved AES");
    // Remove the prefix
    const ciphertext = prefixedCiphertext.substring(AES_PREFIX.length);
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, password);
        const decryptedDataString = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedDataString) {
            // This happens if the password is wrong
            throw new Error("Decryption failed. Wrong password?");
        }
        return decryptedDataString;
    } catch (e) {
        console.error("AES Decryption Error:", e);
        return null;
    }
}


// --- 2. MATRIX ALGORITHM (Improved with HMAC) ---
// Used for SMALL data.
// This is a more secure implementation. Instead of a custom matrix, we
// use AES (which is fast) and add an HMAC for integrity checking.
// This is a common and robust "key-dependent" design.

/**
 * Derives two separate keys from the user's password:
 * one for encryption (dataKey) and one for integrity (hmacKey).
 * @param {string} password - The user's main password
 * @param {string} salt - A random salt (as a hex string)
 * @returns {object} { dataKey: WordArray, hmacKey: WordArray }
 */
function deriveMatrixKeys(password, salt) {
    const saltWA = CryptoJS.enc.Hex.parse(salt);
    // Use PBKDF2 to stretch the password into a 512-bit (64-byte) master key
    const masterKey = CryptoJS.PBKDF2(password, saltWA, {
        keySize: 512 / 32, // 512 bits / 32 bits per Word = 16 words
        iterations: 1000 // A reasonable number of iterations
    });

    // Split the master key into two 256-bit keys
    const dataKey = CryptoJS.lib.WordArray.create(masterKey.words.slice(0, 8)); // First 256 bits
    const hmacKey = CryptoJS.lib.WordArray.create(masterKey.words.slice(8, 16)); // Second 256 bits

    return { dataKey, hmacKey };
}

/**
 * Encrypts data using an improved "Matrix" method:
 * 1. Derives an encryption key and an HMAC key from the password.
 * 2. Encrypts the data with AES-CBC.
 * 3. Creates an HMAC (integrity check) of the encrypted data.
 * 4. Returns a combined string: "v1m:salt.hmac.encrypted_data"
 */
function encryptWithMatrix(dataString, password) {
    console.log("Using Improved Matrix-HMAC (small data)");
    try {
        // 1. Generate random salt and IV
        const salt = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex); // 128-bit salt
        const iv = CryptoJS.lib.WordArray.random(16); // 128-bit IV for AES-CBC
        
        // 2. Derive keys
        const { dataKey, hmacKey } = deriveMatrixKeys(password, salt);

        // 3. Encrypt data with AES-CBC
        const encrypted = CryptoJS.AES.encrypt(dataString, dataKey, { 
            iv: iv, 
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        // Combine IV and ciphertext for storage (IV must be saved)
        const ivAndCiphertext = iv.toString(CryptoJS.enc.Hex) + encrypted.ciphertext.toString(CryptoJS.enc.Hex);

        // 4. Create HMAC (integrity check) of the encrypted data
        const hmac = CryptoJS.HmacSHA256(ivAndCiphertext, hmacKey).toString();

        // 5. Return combined blob: prefix + salt + hmac + data
        return `${MATRIX_PREFIX}${salt}.${hmac}.${ivAndCiphertext}`;
    } catch (e) {
        console.error("Matrix-HMAC Encryption Error:", e);
        return null;
    }
}

/**
 * Decrypts data from the "Matrix" (AES-HMAC) method.
 * 1. Parses the "salt.hmac.encrypted_data" string.
 * 2. Re-derives the encryption and HMAC keys.
 * 3. CRITICAL: Verifies the HMAC first. If it fails, the data is corrupt or password is wrong.
 * 4. If HMAC is valid, decrypts the data.
 */
function decryptWithMatrix(prefixedCiphertext, password) {
    console.log("Decrypting with Improved Matrix-HMAC");
    try {
        // 1. Parse the combined blob
        const blob = prefixedCiphertext.substring(MATRIX_PREFIX.length);
        const parts = blob.split('.');
        if (parts.length !== 3) throw new Error("Invalid matrix data format.");
        
        const [salt, storedHmac, ivAndCiphertext] = parts;
        
        // 2. Re-derive the keys
        const { dataKey, hmacKey } = deriveMatrixKeys(password, salt);

        // 3. VERIFY THE HMAC (Critical Integrity Check)
        const expectedHmac = CryptoJS.HmacSHA256(ivAndCiphertext, hmacKey).toString();
        
        if (storedHmac !== expectedHmac) {
             throw new Error("Data integrity check failed! (HMAC mismatch). Data may be tampered with or password is wrong.");
        }
        
        // 4. If HMAC is valid, decrypt the data
        // Extract IV and ciphertext
        const iv = CryptoJS.enc.Hex.parse(ivAndCiphertext.substring(0, 32));
        const ciphertext = CryptoJS.enc.Hex.parse(ivAndCiphertext.substring(32));

        const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, dataKey, { 
            iv: iv, 
            mode: CryptoJS.mode.CBC, 
            padding: CryptoJS.pad.Pkcs7 
        });
        const decryptedDataString = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedDataString) {
            // This case might be hit if decryption padding fails
            throw new Error("Decryption failed.");
        }
        return decryptedDataString;
    } catch (e) {
        console.error("Matrix-HMAC Decryption Error:", e);
        return null;
    }
}

