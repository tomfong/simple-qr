// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class EncryptService {

//   constructor(
//     private aes256: AES256
//   ) { }

//   async encrypt(data: string): Promise<{ encrypted: Promise<string>, secret1: string, secret2: string }> {
//     const secret = this.randomString(32);
//     const secureKey = await this.aes256.generateSecureKey(secret);
//     const secureIV = await this.aes256.generateSecureIV(secret);
//     return { encrypted: this.aes256.encrypt(secureKey, secureIV, data), secret1: secureKey, secret2: secureIV };
//   }

//   async decrypt(data: string, secret1: string, secret2: string) {
//     return this.aes256.decrypt(secret1, secret2, data);
//   }

//   private randomString(length: number) {
//     var result = '';
//     var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
//     return result;
//   }
// }
