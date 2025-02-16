import * as CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

export class EncryptionUtil {
  // AES-256 encryption
  static encryptFile(data: Buffer, secretKey: string): string {
    const iv = CryptoJS.lib.WordArray.random(16); // Generate 16-byte IV (AES block size)
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.lib.WordArray.create(data),
      secretKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    // Return IV + encrypted data as base64
    const encryptedData = encrypted.toString(); // AES encrypted base64
    const ivBase64 = iv.toString(CryptoJS.enc.Base64); // Base64 encoded IV

    return `${ivBase64}:${encryptedData}`; // Concatenate IV and encrypted data with ":"
  }

  // AES-256 decryption
  static decryptFile(encryptedData: string, secretKey: string): any {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, encryptedBase64] = parts;

    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedBase64);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedBytes },
      secretKey,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
    );

    const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) {
      throw new Error('Decryption failed');
    }

    return decryptedData;
  }

  // convertWordArrayToUint8Array(wordArray: string) {
  //   const arrayOfWords = wordArray.hasOwnProperty('words')
  //     ? wordArray.words
  //     : [];

  //   const length = wordArray.hasOwnProperty('sigBytes')
  //     ? wordArray.sigBytes
  //     : arrayOfWords.length * 4;

  //   const uInt8Array = new Uint8Array(length);
  //   let index = 0;
  //   let word;
  //   let i;

  //   for (i = 0; i < length; i++) {
  //     word = arrayOfWords[i];
  //     uInt8Array[index++] = word >> 24;
  //     uInt8Array[index++] = (word >> 16) & 0xff;
  //     uInt8Array[index++] = (word >> 8) & 0xff;
  //     uInt8Array[index++] = word & 0xff;
  //   }
  //   return uInt8Array;
  // }
}
