import { createHash, createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

/**
 * Encryption utilities for StudyStreaks
 * Secure data encryption and hashing functions
 */

const scryptAsync = promisify(scrypt);

/**
 * Hash a password using bcrypt-style approach
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64) as Buffer;
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [saltHex, hashHex] = hashedPassword.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const hash = Buffer.from(hashHex, "hex");
  
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  return hash.equals(derivedKey);
}

/**
 * Encrypt sensitive data (PII, etc.)
 */
export function encryptData(data: string, key: string): string {
  const algorithm = "aes-256-gcm";
  const iv = randomBytes(16);
  const keyBuffer = createHash("sha256").update(key).digest();
  
  const cipher = createCipheriv(algorithm, keyBuffer, iv);
  
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string, key: string): string {
  const algorithm = "aes-256-gcm";
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const keyBuffer = createHash("sha256").update(key).digest();
  
  const decipher = createDecipheriv(algorithm, keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Hash data for integrity verification
 */
export function hashData(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  return generateSecureToken(32);
}

/**
 * Create a secure API key
 */
export function generateApiKey(): string {
  const timestamp = Date.now().toString();
  const random = generateSecureToken(16);
  return `ss_${timestamp}_${random}`;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return "*".repeat(data.length);
  }
  
  const visible = data.slice(-visibleChars);
  const masked = "*".repeat(data.length - visibleChars);
  return masked + visible;
}

/**
 * Generate a one-time code for verification
 */
export function generateVerificationCode(length: number = 6): string {
  const characters = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Create a secure filename hash
 */
export function generateFileHash(filename: string, userId: string): string {
  const timestamp = Date.now().toString();
  const input = `${filename}:${userId}:${timestamp}`;
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Encrypt personally identifiable information
 */
export async function encryptPII(data: {
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}, encryptionKey: string): Promise<Record<string, string>> {
  const encrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      encrypted[key] = encryptData(value, encryptionKey);
    }
  }
  
  return encrypted;
}

/**
 * Decrypt personally identifiable information
 */
export async function decryptPII(
  encryptedData: Record<string, string>,
  encryptionKey: string
): Promise<Record<string, string>> {
  const decrypted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(encryptedData)) {
    if (value) {
      try {
        decrypted[key] = decryptData(value, encryptionKey);
      } catch (error) {
        console.error(`Failed to decrypt field ${key}:`, error);
        decrypted[key] = "[DECRYPTION_FAILED]";
      }
    }
  }
  
  return decrypted;
}

/**
 * Generate a secure backup encryption key
 */
export function generateBackupKey(): string {
  return generateSecureToken(64);
}

/**
 * Create a digital signature for data integrity
 */
export function createDigitalSignature(data: string, privateKey: string): string {
  const signature = createHash("sha256")
    .update(data + privateKey)
    .digest("hex");
  return signature;
}

/**
 * Verify a digital signature
 */
export function verifyDigitalSignature(
  data: string,
  signature: string,
  privateKey: string
): boolean {
  const expectedSignature = createDigitalSignature(data, privateKey);
  return signature === expectedSignature;
}

/**
 * Secure random number generation
 */
export function generateSecureRandom(min: number, max: number): number {
  const range = max - min + 1;
  const bytes = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytes);
  const randomValue = randomBytes(bytes).readUIntBE(0, bytes);
  
  return min + (randomValue % range);
}

/**
 * Time-based one-time password (TOTP) generator
 */
export function generateTOTP(secret: string, timeWindow: number = 30): string {
  const time = Math.floor(Date.now() / 1000 / timeWindow);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(time, 4);
  
  const hash = createHash("sha1")
    .update(secret + timeBuffer.toString("hex"))
    .digest("hex");
    
  const offset = parseInt(hash[hash.length - 1], 16);
  const code = parseInt(hash.substr(offset * 2, 8), 16) & 0x7fffffff;
  
  return (code % 1000000).toString().padStart(6, "0");
}

// Export encryption utilities
export const encryption = {
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  generateSecureToken,
  hashData,
  generateSessionId,
  generateApiKey,
  maskSensitiveData,
  generateVerificationCode,
  generateFileHash,
  encryptPII,
  decryptPII,
  generateBackupKey,
  createDigitalSignature,
  verifyDigitalSignature,
  generateSecureRandom,
  generateTOTP,
};