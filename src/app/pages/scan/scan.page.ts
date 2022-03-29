import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner, ScanResult } from '@capacitor-community/barcode-scanner';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, IonRouterOutlet, LoadingController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

enum CameraChoice {
  BACK,
  FRONT
}

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

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
  ) { }

  ngOnInit(): void {
    
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

  async stopScanner(): Promise<void> {
    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
    this.cameraActive = false;
  }

  async prepareScanner(): Promise<void> {
    const result = await BarcodeScanner.checkPermission({ force: true });
    if (result.granted) {
      if (this.env.notShowUpdateNotes === false) {
        this.env.notShowUpdateNotes = true;
        this.env.storageSet("not-show-update-notes-v20000", 'yes');
        await this.showUpdateNotes();
      }
      await this.scanQr();
    } else {
      this.permissionAlert?.dismiss();
      this.permissionAlert = await this.presentAlert(
        this.translate.instant("MSG.CAMERA_PERMISSION_1"),
        this.translate.instant("PERMISSION_REQUIRED"),
        this.translate.instant("SETTING")
      );
      await this.permissionAlert.onDidDismiss().then(
        async () => {
          BarcodeScanner.openAppSettings();
        }
      );
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
            this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), 1000, "middle", "center", "long");
            this.scanQr();
            return;
          }
          if (this.env.vibration === 'on' || this.env.vibration === 'on-scanned') {
            await Haptics.vibrate();
          }
          const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
          await this.stopScanner();
          await this.processQrCode(text, loading);
        } else {
          this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), 1000, "middle", "center", "long");
          this.scanQr();
          return;
        }
      }
    );
  }

  async processQrCode(scannedData: string, loading: HTMLIonLoadingElement): Promise<void> {
    this.env.result = scannedData;
    this.router.navigate(['tabs/result', { t: new Date().getTime() }]).then(
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

  async presentToast(msg: string, msTimeout: number, pos: "top" | "middle" | "bottom", align: "left" | "center", size: "short" | "long") {
    if (size === "long") {
      if (align === "left") {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-start-toast",
          position: pos
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-center-toast",
          position: pos
        });
        toast.present();
      }
    } else {
      if (align === "left") {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-start-short-toast",
          position: pos
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-center-short-toast",
          position: pos
        });
        toast.present();
      }
    }
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
      message: this.translate.instant("UPDATE.UPDATE_NOTES"),
      buttons: [this.translate.instant("OK")],
      cssClass: ['left-align', 'alert-bg']
    });
    await alert.present();
  }
}
