import * as CryptoJS from 'crypto-js';

export class EncryptionUtil {
  static encryptFile(fileBuffer: Buffer, secretKey: string): string {
    const fileString = fileBuffer.toString('base64');
    return (
      (CryptoJS.AES.encrypt(fileString, secretKey).toString() as string) || ''
    );
  }

  static decryptFile(encryptedFile: string, secretKey: string): Buffer {
    const bytes = CryptoJS.AES.decrypt(encryptedFile, secretKey);
    const decryptedFile = bytes.toString(CryptoJS.enc.Utf8);
    return Buffer.from(decryptedFile, 'base64');
  }
}
