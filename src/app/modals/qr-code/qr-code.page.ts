import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { LoadingController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { rgbToHex } from 'src/app/utils/helpers';
import { Preferences } from '@capacitor/preferences';
import { QRCodeComponent, QRCodeElementType } from 'angularx-qrcode';

@Component({
    selector: 'app-qr-code',
    templateUrl: './qr-code.page.html',
    styleUrls: ['./qr-code.page.scss'],
    standalone: false
})
export class QrCodePage {

  modal: HTMLIonModalElement;

  @ViewChild('qrcode') qrcodeElement: QRCodeComponent;

  @Input() qrCodeContent: string;
  qrElementType: QRCodeElementType = "canvas";
  errorCorrectionLevel: 'low' | 'medium' | 'quartile' | 'high' | 'L' | 'M' | 'Q' | 'H';
  scale: number = 0.8;
  readonly MAX_WIDTH = 350;
  defaultWidth: number = window.innerHeight * 0.32 > this.MAX_WIDTH ? this.MAX_WIDTH : window.innerHeight * 0.32;

  qrImageDataUrl: string;

  currentBrightness: number = 0;

  isSharing: boolean = false;

  constructor(
    private translate: TranslateService,
    public env: EnvService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private socialSharing: SocialSharing,
    private router: Router,
    private platform: Platform,
    private screenOrientation: ScreenOrientation,
  ) {
    this.setErrorCorrectionLevel();
  }

  async ionViewDidEnter(): Promise<void> {
    this.isSharing = false;
    this.platform.ready().then(async () => {
      if (this.screenOrientation.type.startsWith(this.screenOrientation.ORIENTATIONS.LANDSCAPE)) {
        this.presentToast(this.translate.instant("MSG.PORTRAIT_ONLY"), "short", "bottom");
        this.screenOrientation.unlock();
      }
      await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT).then(
        _ => {
          if (this.qrcodeElement != null) {
            setTimeout(() => {
              this.qrcodeElement.width = this.platform.height() * this.scale * 0.4;
              if (this.qrcodeElement.width > this.MAX_WIDTH) {
                this.qrcodeElement.width = this.MAX_WIDTH;
              }
            }, 500)
          }
        }
      )
      await ScreenBrightness.getBrightness().then(
        value => {
          this.currentBrightness = value.brightness
        }
      )
      if (this.env.autoMaxBrightness === 'on') {
        await ScreenBrightness.setBrightness({ brightness: 1.0 }).catch(
          err => {
            if (this.env.isDebugging) {
              this.presentToast("Err when ScreenBrightness.setBrightness 1.0: " + JSON.stringify(err), "long", "top");
            }
          }
        )
      }
      await this.modalController.getTop().then(
        async (modal: HTMLIonModalElement) => {
          this.modal = modal;
          this.modal.addEventListener("ionBreakpointDidChange", (ev: any) => {
            if (this.qrcodeElement != null) {
              switch (ev.detail.breakpoint) {
                case 1:
                  this.qrcodeElement.width = this.platform.width() * this.scale;
                  break;
                case 0.5:
                  this.qrcodeElement.width = this.platform.height() * this.scale * 0.4;
                  break
              }
              if (this.qrcodeElement.width > this.MAX_WIDTH) {
                this.qrcodeElement.width = this.MAX_WIDTH;
              }
            }
          })
          this.modal.onDidDismiss().then(
            async _ => {
              if (this.platform.is('android')) {
                await ScreenBrightness.setBrightness({ brightness: -1 }).catch(
                  err => {
                    if (this.env.isDebugging) {
                      this.presentToast("Err when ScreenBrightness.setBrightness -1: " + JSON.stringify(err), "long", "top");
                    }
                  }
                )
              } else if (this.platform.is('ios')) {
                await ScreenBrightness.setBrightness({ brightness: this.currentBrightness }).catch(
                  err => {
                    if (this.env.isDebugging) {
                      this.presentToast(`Err when ScreenBrightness.setBrightness ${this.currentBrightness}: ` + JSON.stringify(err), "long", "top");
                    }
                  }
                )
              }
              await this.env.toggleOrientationChange();
            }
          );
        }
      )
    });
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

  async onErrorCorrectionLevelChange() {
    this.setErrorCorrectionLevel();
    await Preferences.set({ key: this.env.KEY_ERROR_CORRECTION_LEVEL, value: this.env.errorCorrectionLevel });
    if (this.qrcodeElement != null) {
      this.qrcodeElement.errorCorrectionLevel = this.errorCorrectionLevel;
    } else {
      if (this.env.isDebugging) {
        this.presentToast("Cannot ref qrcodeElement!", "long", "top");
      }
    }
  }

  goQrSetting() {
    this.modalController.dismiss();
    this.router.navigate(['setting-qr']);
  }

  async shareQrCode(): Promise<void> {
    const loading = await this.presentLoading(this.translate.instant('PREPARING'));
    this.isSharing = true;
    const currentWidth = this.qrcodeElement.width;
    this.qrcodeElement.width = 1000;
    setTimeout(async () => {
      const canvases = document.querySelectorAll("canvas") as NodeListOf<HTMLCanvasElement>;
      const canvas = canvases[canvases.length - 1];
      if (this.qrImageDataUrl) {
        delete this.qrImageDataUrl;
      }
      this.qrImageDataUrl = canvas.toDataURL("image/png", 1);
      loading.dismiss();
      const loading2 = await this.presentLoading(this.translate.instant('SHARING'));
      await this.socialSharing.share(this.translate.instant('MSG.SHARE_QR'), this.translate.instant('SIMPLE_QR'), this.qrImageDataUrl, null).then(
        _ => {
          this.qrcodeElement.width = currentWidth;
          delete this.qrImageDataUrl;
          this.isSharing = false;
          loading2.dismiss();
        }
      ).catch(
        err => {
          if (this.env.isDebugging) {
            this.presentToast("Error when call SocialSharing.share: " + JSON.stringify(err), "long", "top");
          }
          this.qrcodeElement.width = currentWidth;
          delete this.qrImageDataUrl;
          this.isSharing = false;
          loading2.dismiss();
        }
      );
    }, 500)
  }

  get qrColorDark(): string {
    return rgbToHex(this.env.qrCodeDarkR, this.env.qrCodeDarkG, this.env.qrCodeDarkB);
  }

  get qrColorLight(): string {
    return rgbToHex(this.env.qrCodeLightR, this.env.qrCodeLightG, this.env.qrCodeLightB);
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg
    });
    await loading.present();
    return loading;
  }

  get color() {
    switch (this.env.colorTheme) {
      case 'dark':
        return 'dark';
      case 'light':
        return 'white';
      case 'black':
        return 'black';
      default:
        return 'white';
    }
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Light })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }
}
