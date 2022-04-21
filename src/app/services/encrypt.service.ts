import { Injectable } from '@angular/core';
import { AES256 } from '@awesome-cordova-plugins/aes-256/ngx';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {

  private secureKey: string = '';
  private secureIV: string = '';

  constructor(
    public env: EnvService,
    private aes256: AES256
  ) { }

  async generateSecureKeyAndIV(secret: string) {
    this.secureKey = await this.aes256.generateSecureKey(secret); // Returns a 32 bytes string
    this.secureIV = await this.aes256.generateSecureIV(secret); // Returns a 16 bytes string
  }

  async encrypt(data: string) {
    return this.aes256.encrypt(this.secureKey, this.secureIV, data);
  }

  async decrypt(data: string) {
    return this.aes256.decrypt(this.secureKey, this.secureIV, data);
  }
}
