// Encryption prefixes
const AES_PREFIX = "AES_ENCRYPTED:";
const MATRIX_PREFIX = "MATRIX_ENCRYPTED:";

// Simple Matrix encryption implementation
function encryptWithMatrix(data, password) {
    try {
        // Create a simple matrix transformation
        const keyMatrix = createKeyMatrix(password);
        const dataMatrix = textToMatrix(data);
        
        // Multiply matrices (simplified encryption)
        const encryptedMatrix = multiplyMatrices(keyMatrix, dataMatrix);
        
        // Convert back to string
        const encryptedString = matrixToBase64(encryptedMatrix);
        
        return MATRIX_PREFIX + encryptedString;
    } catch (error) {
        console.error("Matrix encryption error:", error);
        return null;
    }
}

function decryptWithMatrix(encryptedData, password) {
    try {
        // Remove prefix
        const data = encryptedData.substring(MATRIX_PREFIX.length);
        
        // Recreate key matrix
        const keyMatrix = createKeyMatrix(password);
        const inverseKeyMatrix = invertMatrix(keyMatrix);
        
        // Convert from base64 to matrix
        const encryptedMatrix = base64ToMatrix(data);
        
        // Multiply by inverse to decrypt
        const decryptedMatrix = multiplyMatrices(inverseKeyMatrix, encryptedMatrix);
        
        // Convert back to text
        return matrixToText(decryptedMatrix);
    } catch (error) {
        console.error("Matrix decryption error:", error);
        return null;
    }
}

// Helper functions for matrix encryption
function createKeyMatrix(password) {
    // Create a deterministic 2x2 matrix from password
    const hash = CryptoJS.MD5(password).toString();
    const nums = [];
    
    for (let i = 0; i < 8; i += 2) {
        nums.push(parseInt(hash.substr(i, 2), 16) / 255);
    }
    
    // Ensure matrix is invertible (determinant != 0)
    const det = nums[0] * nums[3] - nums[1] * nums[2];
    if (Math.abs(det) < 0.1) {
        nums[0] += 0.5;
        nums[3] += 0.5;
    }
    
    return [
        [nums[0], nums[1]],
        [nums[2], nums[3]]
    ];
}

function textToMatrix(text) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
        bytes.push(text.charCodeAt(i));
    }
    
    // Pad to even length
    if (bytes.length % 2 !== 0) {
        bytes.push(0);
    }
    
    // Convert to 2xN matrix
    const matrix = [[], []];
    for (let i = 0; i < bytes.length; i += 2) {
        matrix[0].push(bytes[i]);
        matrix[1].push(bytes[i + 1]);
    }
    
    return matrix;
}

function matrixToText(matrix) {
    const bytes = [];
    for (let i = 0; i < matrix[0].length; i++) {
        bytes.push(Math.round(matrix[0][i]));
        bytes.push(Math.round(matrix[1][i]));
    }
    
    // Remove padding zeros
    while (bytes.length > 0 && bytes[bytes.length - 1] === 0) {
        bytes.pop();
    }
    
    return String.fromCharCode(...bytes);
}

function multiplyMatrices(a, b) {
    const result = [[], []];
    
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < 2; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i].push(sum);
        }
    }
    
    return result;
}

function invertMatrix(matrix) {
    const a = matrix[0][0], b = matrix[0][1];
    const c = matrix[1][0], d = matrix[1][1];
    
    const det = a * d - b * c;
    
    return [
        [d / det, -b / det],
        [-c / det, a / det]
    ];
}

function matrixToBase64(matrix) {
    const flatArray = [...matrix[0], ...matrix[1]];
    const jsonString = JSON.stringify(flatArray);
    return btoa(jsonString);
}

function base64ToMatrix(base64String) {
    const jsonString = atob(base64String);
    const flatArray = JSON.parse(jsonString);
    
    const mid = flatArray.length / 2;
    return [
        flatArray.slice(0, mid),
        flatArray.slice(mid)
    ];
}

// AES encryption implementation
function encryptWithAES(data, password) {
    try {
        const encrypted = CryptoJS.AES.encrypt(data, password).toString();
        return AES_PREFIX + encrypted;
    } catch (error) {
        console.error("AES encryption error:", error);
        return null;
    }
}

function decryptWithAES(encryptedData, password) {
    try {
        const data = encryptedData.substring(AES_PREFIX.length);
        const decrypted = CryptoJS.AES.decrypt(data, password);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("AES decryption error:", error);
        return null;
    }
}