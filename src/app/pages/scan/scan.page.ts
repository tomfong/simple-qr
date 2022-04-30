import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner, ScanResult } from '@capacitor-community/barcode-scanner';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, IonContent, IonRouterOutlet, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
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

  cameraChoice: CameraChoice = CameraChoice.BACK;
  cameraActive: boolean = false;
  flashActive: boolean = false;

  permissionAlert: HTMLIonAlertElement;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public routerOutlet: IonRouterOutlet,
    private router: Router,
    private env: EnvService,
    public translate: TranslateService,
    private toastController: ToastController,
    private platform: Platform,
  ) {
    if (this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(-1, async () => {
        if (!this.routerOutlet.canGoBack()) {
          if (this.router.url?.startsWith("/tabs/result")) {
            const urlSeg = this.router.url?.split(";")
            if (urlSeg.length > 1) {
              if (urlSeg[1].startsWith("from=")) {
                const from = urlSeg[1].substring(5);
                if (from.length > 0) {
                  this.router.navigate([`/tabs/${from}`], { replaceUrl: true });
                }
              }
            }
          } else {
            if (this.router.url?.startsWith("/tabs")) {
              if (this.router.url != "/tabs/scan") {
                this.router.navigate(['/tabs/scan'], { replaceUrl: true });
              } else {
                await this.confirmExitApp();
              }
            }
          }
        }
      });
    }
  }

  async ionViewDidEnter(): Promise<void> {
    await SplashScreen.hide();
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

  async loadPatchNote() {
    await this.env.storageGet(this.env.PATCH_NOTE_STORAGE_KEY).then(
      async value => {
        if (value != null) {
          this.env.notShowUpdateNotes = (value === 'yes' ? true : false);
        } else {
          this.env.notShowUpdateNotes = false;
        }
        await this.env.storageSet(this.env.PATCH_NOTE_STORAGE_KEY, 'yes');
        if (this.env.notShowUpdateNotes === false) {
          this.env.notShowUpdateNotes = true;
          await this.showUpdateNotes();
        }
      }
    );   
  }

  async stopScanner(): Promise<void> {
    await BarcodeScanner.stopScan();
    this.cameraActive = false;
  }

  async prepareScanner(): Promise<void> {
    const result = await BarcodeScanner.checkPermission({ force: true });
    if (result.granted) {
      await this.loadPatchNote();
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
    await BarcodeScanner.startScan().then(
      async (result: ScanResult) => {
        if (result.hasContent) {
          console.log(result.content);
          const text = result.content;
          if (text === undefined || text === null || (text && text.trim().length <= 0) || text === "") {
            this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), "short", "center");
            this.scanQr();
            return;
          }
          if (this.env.vibration === 'on' || this.env.vibration === 'on-scanned') {
            await Haptics.vibrate();
          }
          const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
          await this.stopScanner();
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
    this.router.navigate(['tabs/result', { from: 'scan', t: new Date().getTime() }]).then(
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
      message: msg,
      mode: "ios"
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

  async showUpdateNotes() {
    const alert = await this.alertController.create({
      header: this.translate.instant("UPDATE_NOTES"),
      subHeader: this.env.appVersionNumber,
      message: this.platform.is('ios')? this.translate.instant("UPDATE.UPDATE_NOTES_IOS") : this.translate.instant("UPDATE.UPDATE_NOTES_ANDROID"),
      buttons: [
        {
          text:  this.translate.instant("OK"),
          handler: () => true,
        },
        {
          text:  this.translate.instant("GO_STORE_RATE"),
          handler: () => {
            if (this.platform.is('android')) {
              this.openGooglePlay();
            } else if (this.platform.is('ios')) {
              this.openAppStore();
            }
          }
        }
       ],
      cssClass: ['left-align', 'alert-bg']
    });
    await alert.present();
  }

  openGooglePlay(): void {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
  }

  openAppStore(): void {
    window.open(this.env.APP_STORE_URL, '_system');
  }

  async confirmExitApp(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('EXIT_APP'),
      message: this.translate.instant('MSG.EXIT_APP'),
      cssClass: ['alert-bg'],
      buttons: [
        {
          text: this.translate.instant('EXIT'),
          handler: () => {
            navigator['app'].exitApp();
          }
        },
        {
          text: this.translate.instant('GO_STORE_RATE'),
          handler: () => {
            this.openGooglePlay();
          }
        }
      ]
    });
    await alert.present();
  }

}
