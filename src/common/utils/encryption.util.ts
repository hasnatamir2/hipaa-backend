import * as CryptoJS from 'crypto-js';

export class EncryptionUtil {
  static encryptFile(fileBuffer: Buffer, secretKey: string): string {
    const fileString = fileBuffer.toString('base64');
    return (
      (CryptoJS.AES.encrypt(fileString, secretKey).toString() as string) || ''
    );
  }

  static decryptFile(encryptedData: string, secretKey: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8) as string; // Assuming it's a UTF-8 string
  }
}
