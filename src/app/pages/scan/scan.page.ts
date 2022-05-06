import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner, ScanResult } from '@capacitor-community/barcode-scanner';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, IonRouterOutlet, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';

enum CameraChoice {
  BACK,
  FRONT
}

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage {

  @ViewChild('content') contentEl: HTMLIonContentElement;

  cameraChoice: CameraChoice = CameraChoice.BACK;
  cameraActive: boolean = false;
  flashActive: boolean = false;

  permissionAlert: HTMLIonAlertElement;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public routerOutlet: IonRouterOutlet,
    private router: Router,
    public env: EnvService,
    public translate: TranslateService,
  ) { }

  ionViewWillEnter() {
    if (this.contentEl != null) {
      this.contentEl.color = "darker";
    }
  }

  async ionViewDidEnter(): Promise<void> {
    await SplashScreen.hide()
    await BarcodeScanner.disableTorch().then(
      _ => {
        this.flashActive = false;
      }
    );
    await this.prepareScanner();
  }

  async ionViewDidLeave(): Promise<void> {
    await BarcodeScanner.disableTorch().then(
      _ => {
        this.flashActive = false;
      }
    );
    await this.stopScanner();
  }

  async stopScanner(): Promise<void> {
    await BarcodeScanner.stopScan();
    this.cameraActive = false;
  }

  async prepareScanner(): Promise<void> {
    const result = await BarcodeScanner.checkPermission({ force: true });
    if (result.granted) {
      await this.scanQr();
    } else {
      this.permissionAlert?.dismiss();
      this.permissionAlert = await this.alertController.create({
        header: this.translate.instant("PERMISSION_REQUIRED"),
        message: this.translate.instant("MSG.CAMERA_PERMISSION"),
        buttons: [
          {
            text: this.translate.instant("SETTING"),
            handler: () => {
              BarcodeScanner.openAppSettings();
              return true;
            }
          },
          {
            text: this.translate.instant("OK"),
            handler: () => {
              return true;
            }
          }
        ],
        cssClass: ['alert-bg']
      });
      await this.permissionAlert.present();
    }
  }

  async scanQr(): Promise<void> {
    await this.stopScanner();
    await BarcodeScanner.hideBackground();
    this.cameraActive = true;
    await BarcodeScanner.prepare();
    if (this.contentEl != null) {
      this.contentEl.color = "";
    }
    await BarcodeScanner.startScan().then(
      async (result: ScanResult) => {
        if (result.hasContent) {
          const text = result.content;
          if (text === undefined || text === null || (text && text.trim().length <= 0) || text === "") {
            this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), "short", "center");
            this.scanQr();
            return;
          }
          if (this.contentEl != null) {
            this.contentEl.color = "darker";
          }
          if (this.env.vibration === 'on' || this.env.vibration === 'on-scanned') {
            await Haptics.vibrate({ duration: 100 });
          }
          const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
          await this.processQrCode(text, result.format, loading);
        } else {
          this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), "short", "center");
          this.scanQr();
          return;
        }
      }
    );
  }

  async processQrCode(scannedData: string, format: string, loading: HTMLIonLoadingElement): Promise<void> {
    this.env.result = scannedData;
    this.env.resultFormat = format;
    this.env.recordSource = "scan";
    this.env.detailedRecordSource = "scan-camera";
    this.env.viewResultFrom = "/tabs/scan";
    this.router.navigate(['tabs/result']).then(
      () => {
        loading.dismiss();
      }
    );
  }

  async toggleFlash(): Promise<void> {
    if (!this.flashActive) {
      await BarcodeScanner.enableTorch().then(
        _ => {
          this.flashActive = true;
        }
      )
    } else {
      await BarcodeScanner.disableTorch().then(
        _ => {
          this.flashActive = false;
        }
      );
    }
  }

  async presentAlert(msg: string, head: string, buttonText: string, buttonless: boolean = false): Promise<HTMLIonAlertElement> {
    let alert: any;
    if (!buttonless) {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [buttonText],
        cssClass: ['alert-bg']
      });
    } else {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [],
        backdropDismiss: false,
        cssClass: ['alert-bg']
      });
    }
    await alert.present();
    return alert;
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg
    });
    await loading.present();
    return loading;
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
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }
}
