import * as CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';
// import { createCipheriv, randomBytes } from 'crypto';

export class EncryptionUtil {
  // AES-256 encryption
  private static readonly key = CryptoJS.enc.Utf8.parse(
    '12345678901234567890123456789012',
  ); // 32-byte key
  private static readonly iv = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16-byte IV

  static encryptFile(data: Buffer): Buffer {
    const wordArray = CryptoJS.lib.WordArray.create(data); // Convert buffer to WordArray
    const encrypted = CryptoJS.AES.encrypt(wordArray, this.key, {
      iv: this.iv,
    });

    // Convert to Base64 and return as buffer
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    return Buffer.from(encryptedBase64, 'base64');
  }

  // AES-256 decryption
  static decryptFile(encryptedBuffer: Buffer): any {
    const encryptedBase64 = encryptedBuffer.toString('base64'); // Convert buffer to Base64 string
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, this.key, {
      iv: this.iv,
    });

    // Convert the decrypted data back to a buffer (in its original binary format)
    const decryptedWordArray = CryptoJS.enc.Base64.stringify(decrypted); // Convert to Base64 string first
    return Buffer.from(decryptedWordArray, 'base64');
  }
}
