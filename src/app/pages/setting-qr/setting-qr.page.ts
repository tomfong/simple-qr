import { Component } from '@angular/core';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { EnvService } from 'src/app/services/env.service';
import { rgbToHex } from 'src/app/utils/helpers';

@Component({
  selector: 'app-setting-qr',
  templateUrl: './setting-qr.page.html',
  styleUrls: ['./setting-qr.page.scss'],
})
export class SettingQrPage {

  qrCodeContent: string = 'https://github.com/tomfong/simple-qr';
  qrElementType: NgxQrcodeElementTypes = NgxQrcodeElementTypes.CANVAS;
  errorCorrectionLevel: NgxQrcodeErrorCorrectionLevels;
  readonly MAX_WIDTH = 300;
  defaultWidth: number = window.innerWidth * 0.4 > this.MAX_WIDTH ? this.MAX_WIDTH : window.innerWidth * 0.4;
  qrMargin: number = 3;

  constructor(
    public env: EnvService,
  ) { 
    this.setErrorCorrectionLevel();
  }

  get qrColorDark(): string {
    return rgbToHex(this.env.qrCodeDarkR, this.env.qrCodeDarkG, this.env.qrCodeDarkB);
  }

  get qrColorLight(): string {
    return rgbToHex(this.env.qrCodeLightR, this.env.qrCodeLightG, this.env.qrCodeLightB);
  }

  setErrorCorrectionLevel() {
    switch (this.env.errorCorrectionLevel) {
      case 'L':
        this.errorCorrectionLevel = NgxQrcodeErrorCorrectionLevels.LOW;
        break;
      case 'M':
        this.errorCorrectionLevel = NgxQrcodeErrorCorrectionLevels.MEDIUM;
        break;
      case 'Q':
        this.errorCorrectionLevel = NgxQrcodeErrorCorrectionLevels.QUARTILE;
        break;
      case 'H':
        this.errorCorrectionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
        break;
      default:
        this.errorCorrectionLevel = NgxQrcodeErrorCorrectionLevels.MEDIUM;
    }
  }

  async saveErrorCorrectionLevel() {
    this.setErrorCorrectionLevel();
    await this.env.storageSet("error-correction-level", this.env.errorCorrectionLevel);
  }

  async saveQrCodeDarkR() {
    await this.env.storageSet("qrCodeDarkR", this.env.qrCodeDarkR);
  }

  async saveQrCodeDarkG() {
    await this.env.storageSet("qrCodeDarkG", this.env.qrCodeDarkG);
  }

  async saveQrCodeDarkB() {
    await this.env.storageSet("qrCodeDarkB", this.env.qrCodeDarkB);
  }

  async saveQrCodeLightR() {
    await this.env.storageSet("qrCodeLightR", this.env.qrCodeLightR);
  }

  async saveQrCodeLightG() {
    await this.env.storageSet("qrCodeLightG", this.env.qrCodeLightG);
  }

  async saveQrCodeLightB() {
    await this.env.storageSet("qrCodeLightB", this.env.qrCodeLightB);
  }
}
