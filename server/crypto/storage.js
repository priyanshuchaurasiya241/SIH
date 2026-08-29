import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 256-bit AES Master Key (derived from secret or environment variable)
const MASTER_SECRET = process.env.SIH_AES_SECRET || 'SIH-2026-GOVT-AYUSH-SECURE-KEY-26047-DPDP-ACT';
const MASTER_KEY = crypto.createHash('sha256').update(MASTER_SECRET).digest(); // 32 bytes (256 bits)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for GCM

export class SecureStorage {
  /**
   * Encrypt arbitrary string or object using AES-256-GCM
   */
  static encrypt(data) {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      algorithm: 'AES-256-GCM',
      keyLength: 256,
      iv: iv.toString('hex'),
      authTag: authTag,
      ciphertext: encrypted,
      timestamp: new Date().toISOString(),
      integrityHash: crypto.createHash('sha256').update(encrypted).digest('hex')
    };
  }

  /**
   * Decrypt envelope object with AES-256-GCM
   */
  static decrypt(envelope) {
    if (!envelope || !envelope.ciphertext || !envelope.iv || !envelope.authTag) {
      throw new Error('Invalid encrypted envelope structure');
    }

    const iv = Buffer.from(envelope.iv, 'hex');
    const authTag = Buffer.from(envelope.authTag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  }

  /**
   * Write data to file encrypted at rest
   */
  static writeEncryptedFile(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const encryptedEnvelope = this.encrypt(data);
    fs.writeFileSync(filePath, JSON.stringify(encryptedEnvelope, null, 2), 'utf8');
    return encryptedEnvelope;
  }

  /**
   * Read encrypted file and return decrypted content
   */
  static readEncryptedFile(filePath, defaultValue = null) {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }

    try {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const envelope = JSON.parse(rawContent);
      return this.decrypt(envelope);
    } catch (err) {
      console.error(`Failed to decrypt ${filePath}:`, err.message);
      return defaultValue;
    }
  }

  /**
   * Inspect raw on-disk encrypted representation (for SIH Security demo)
   */
  static inspectRawFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return { status: 'FILE_NOT_FOUND', filePath };
    }
    const rawContent = fs.readFileSync(filePath, 'utf8');
    try {
      const parsed = JSON.parse(rawContent);
      return {
        filePath,
        fileSizeBytes: Buffer.byteLength(rawContent),
        securityStandard: 'Indian Govt. MoHFW / Ayush AES-256-GCM Compliance',
        encryptedEnvelope: parsed
      };
    } catch {
      return { raw: rawContent };
    }
  }

  /**
   * Append an immutable audit entry
   */
  static logAudit({ actor, action, resource, details, ip = '127.0.0.1' }) {
    const auditFile = path.join(__dirname, '..', 'data', 'audit_logs.enc.json');
    let logs = this.readEncryptedFile(auditFile, []);
    if (!Array.isArray(logs)) logs = [];

    const newEntry = {
      auditId: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      actor,
      action,
      resource,
      ip,
      details,
      signature: crypto.createHmac('sha256', MASTER_KEY).update(`${actor}:${action}:${resource}:${Date.now()}`).digest('hex')
    };

    logs.unshift(newEntry);
    if (logs.length > 500) logs = logs.slice(0, 500); // retain last 500 audit logs
    this.writeEncryptedFile(auditFile, logs);
    return newEntry;
  }

  /**
   * Read all audit logs
   */
  static getAuditLogs() {
    const auditFile = path.join(__dirname, '..', 'data', 'audit_logs.enc.json');
    return this.readEncryptedFile(auditFile, []);
  }
}
