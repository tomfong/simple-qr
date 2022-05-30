import { Component } from '@angular/core';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-qr-ecl',
  templateUrl: './setting-qr-ecl.page.html',
  styleUrls: ['./setting-qr-ecl.page.scss'],
})
export class SettingQrEclPage {

  qrCodeContent: string = 'https://github.com/tomfong/simple-qr';
  qrElementType: NgxQrcodeElementTypes = NgxQrcodeElementTypes.CANVAS;
  errorCorrectionLevel: NgxQrcodeErrorCorrectionLevels;
  readonly MAX_WIDTH = 350;
  defaultWidth: number = window.innerWidth * 0.6 > this.MAX_WIDTH ? this.MAX_WIDTH : window.innerWidth * 0.6;
  qrMargin: number = 3;

  constructor(
    public env: EnvService,
  ) { 
    this.setErrorCorrectionLevel();
  }

  get qrColorDark(): string {
    return "#222428";
  }

  get qrColorLight(): string {
    return "#ffffff";
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
}
