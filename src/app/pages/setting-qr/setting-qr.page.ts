import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { QRCodeElementType } from 'angularx-qrcode';
import { EnvService } from 'src/app/services/env.service';
import { rgbToHex } from 'src/app/utils/helpers';

@Component({
  selector: 'app-setting-qr',
  templateUrl: './setting-qr.page.html',
  styleUrls: ['./setting-qr.page.scss'],
})
export class SettingQrPage {

  qrCodeContent: string = 'https://github.com/tomfong/simple-qr';
  qrElementType: QRCodeElementType = "canvas";
  errorCorrectionLevel: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
  readonly MAX_WIDTH = 300;
  defaultWidth: number = window.innerWidth * 0.4 > this.MAX_WIDTH ? this.MAX_WIDTH : window.innerWidth * 0.4;

  colorLocked: boolean = true;
  backgroundColorLocked: boolean = true;
  marginLocked: boolean = true;

  constructor(
    public env: EnvService,
    private translate: TranslateService,
    private alertController: AlertController,
    private platform: Platform,
  ) {
    this.setErrorCorrectionLevel();
  }

  ionViewWillLeave() {
    this.colorLocked = true;
    this.backgroundColorLocked = true;
    this.marginLocked = true;
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
        this.errorCorrectionLevel = 'low';
        break;
      case 'M':
        this.errorCorrectionLevel = 'medium';
        break;
      case 'Q':
        this.errorCorrectionLevel = 'quartile';
        break;
      case 'H':
        this.errorCorrectionLevel = 'high';
        break;
      default:
        this.errorCorrectionLevel = 'medium';
    }
  }

  async saveErrorCorrectionLevel() {
    this.setErrorCorrectionLevel();
    await Preferences.set({ key: this.env.KEY_ERROR_CORRECTION_LEVEL, value: this.env.errorCorrectionLevel });
  }

  async saveQrCodeDarkR() {
    await Preferences.set({ key: this.env.KEY_QR_CODE_DARK_R, value: JSON.stringify(this.env.qrCodeDarkR) });
  }

  async saveQrCodeDarkG() {
    await Preferences.set({ key: this.env.KEY_QR_CODE_DARK_G, value: JSON.stringify(this.env.qrCodeDarkG) });
  }

  async saveQrCodeDarkB() {
    await Preferences.set({ key: this.env.KEY_QR_CODE_DARK_B, value: JSON.stringify(this.env.qrCodeDarkB) });
  }

  async saveQrCodeLightR() {
    await Preferences.set({ key: this.env.KEY_QR_CODE_LIGHT_R, value: JSON.stringify(this.env.qrCodeLightR) });
  }

  async saveQrCodeLightG() {
    await Preferences.set({ key: this.env.KEY_QR_CODE_LIGHT_G, value: JSON.stringify(this.env.qrCodeLightG) });
  }

  async saveQrCodeLightB() {
    await Preferences.set({ key: this.env.KEY_QR_CODE_LIGHT_B, value: JSON.stringify(this.env.qrCodeLightB) });
  }

  async saveQrCodeMargin() {
    await Preferences.set({ key: this.env.KEY_QR_CODE_MARGIN, value: JSON.stringify(this.env.qrCodeMargin) });
  }

  async resetDefault() {
    const alert = await this.alertController.create({
      header: this.translate.instant('RESET_DEFAULT'),
      message: this.translate.instant('MSG.RESET_DEFAULT'),
      cssClass: ['alert-bg'],
      buttons: [
        {
          text: this.translate.instant('YES'),
          handler: async () => {
            this.colorLocked = true;
            this.backgroundColorLocked = true;
            this.marginLocked = true;
            await this.env.resetQrCodeSettings();
          }
        },
        {
          text: this.translate.instant('NO'),
          handler: () => true
        }
      ]
    });
    await alert.present();
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Medium })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }

  get isAndroid(): boolean {
    return this.platform.is('android');
  }

  get isIos(): boolean {
    return this.platform.is('ios');
  }

}
