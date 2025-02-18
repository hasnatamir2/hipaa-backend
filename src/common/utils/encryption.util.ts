import * as CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

export class EncryptionUtil {
  // AES-256 encryption
  static encryptFile(data: Buffer, secretKey: string): string {
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data.toString())),
      secretKey,
    );
    return encrypted.toString();
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

    // const decryptedData = decrypted.toString(
    //   CryptoJS.enc.Utf8
    // );
    // if (!decryptedData) {
    //   throw new Error('Decryption failed');
    // }
    const decryptedData = Buffer.from(
      decrypted.toString(CryptoJS.enc.Base64),
      'base64',
    );
    return decryptedData;
  }

  static decryptFileSimplified(encryptedData: string, secretKey: string) {
    try {
      // Decrypt the data using AES
      const decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey);

      // Check if decryption is successful
      if (!decrypted || !decrypted.sigBytes) {
        throw new Error('Decryption failed or invalid data');
      }

      // Convert the decrypted data to a hexadecimal string and then to a Buffer
      const decryptedData = decrypted.toString(CryptoJS.format.Hex);
      const buffer = Buffer.from(decryptedData, 'hex');
      return buffer;
    } catch (err) {
      console.error('Error during decryption:', err);
      return null; // Return null if decryption fails
    }
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
