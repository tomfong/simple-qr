import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, IonRouterOutlet, LoadingController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { EnvService } from 'src/app/services/env.service';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

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

  scanSubscription: Subscription;

  motionSubscription: Subscription;
  motionX: number;
  motionY: number;
  motionZ: number;
  motionlessCount: number = 0;

  cameraChoice: CameraChoice = CameraChoice.BACK;
  cameraActive: boolean = false;
  flashActive: boolean = false;

  pauseAlert: HTMLIonAlertElement;

  resumeSubscription: Subscription;
  pauseSubscription: Subscription;

  constructor(
    private platform: Platform,
    private qrScanner: QRScanner,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public routerOutlet: IonRouterOutlet,
    private deviceMotion: DeviceMotion,
    private router: Router,
    private env: EnvService,
    public translate: TranslateService,
    private toastController: ToastController,
  ) { }

  ngOnInit(): void {
    this.platform.ready().then(
      async () => {
        this.pauseSubscription = this.platform.pause.subscribe(
          async () => {
            if (this.motionSubscription) {
              this.motionSubscription.unsubscribe();
              this.motionSubscription = undefined;
              this.motionlessCount = 0;
            }
            await this.qrScanner.destroy().then(
              () => {
                this.cameraActive = false;
              }
            );
          }
        );
        this.resumeSubscription = this.platform.resume.subscribe(
          async () => {
            await this.prepareScanner();
          }
        )
      }
    );
  }

  async ionViewDidEnter(): Promise<void> {
    await SplashScreen.hide();
    this.qrScanner.disableLight().then(
      () => {
        this.flashActive = false;
      }
    );
    await this.prepareScanner();
  }

  ionViewWillLeave() {
    if (this.motionSubscription) {
      this.motionSubscription.unsubscribe();
      this.motionSubscription = undefined;
      this.motionlessCount = 0;
    }
  }

  async ionViewDidLeave(): Promise<void> {
    if (this.resumeSubscription) {
      this.resumeSubscription.unsubscribe();
      this.resumeSubscription = undefined;
    }
    if (this.pauseSubscription) {
      this.pauseSubscription.unsubscribe();
      this.pauseSubscription = undefined;
    }
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
      this.scanSubscription = undefined;
    }
    if (this.cameraActive) {
      await this.qrScanner.destroy().then(
        () => {
          this.cameraActive = false;
        }
      );
    }
    if (this.pauseAlert) {
      this.pauseAlert.dismiss();
      this.pauseAlert = undefined;
    }
  }

  async prepareScanner(): Promise<void> {
    if (this.motionSubscription) {
      this.motionSubscription.unsubscribe();
      this.motionSubscription = undefined;
      this.motionlessCount = 0;
    }
    let denied = false;
    await this.qrScanner.getStatus().then(
      async (status: QRScannerStatus) => {
        if (status.denied) {
          const alert = await this.presentAlert(
            this.translate.instant("MSG.CAMERA_PERMISSION_1"),
            this.translate.instant("PERMISSION_REQUIRED"),
            this.translate.instant("SETTING")
          );
          await alert.onDidDismiss().then(
            async () => {
              denied = true;
            }
          );
        }
      }
    );
    if (denied) {
      this.qrScanner.openSettings();
      return;
    }
    await this.qrScanner.prepare().then(
      async (status: QRScannerStatus) => {
        if (status.authorized) {
          if (this.env.notShowUpdateNotes === false) {
            this.env.notShowUpdateNotes = true;
            this.env.storageSet("not-show-update-notes", 'yes');
            await this.showUpdateNotes();
          }
          await this.scanQr();
        }
      },
      async err => {
        if (err.name === "CAMERA_ACCESS_DENIED") {
          const alert = await this.presentAlert(
            this.translate.instant("MSG.CAMERA_PERMISSION_2"),
            this.translate.instant("PERMISSION_REQUIRED"),
            this.translate.instant("OK")
          );
          await alert.onDidDismiss().then(
            async () => {
              await this.prepareScanner();
            }
          );
        }
      }
    );
  }

  async scanQr(): Promise<void> {
    const loading = await this.presentLoading(this.translate.instant("PREPARING"));
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
    }
    if (this.motionSubscription) {
      this.motionSubscription.unsubscribe();
      this.motionSubscription = undefined;
      this.motionlessCount = 0;
    }
    if (this.pauseAlert) {
      this.pauseAlert.dismiss();
      this.pauseAlert = undefined;
    }
    await this.qrScanner.show().then(
      () => {
        loading.dismiss();
        this.cameraActive = true;
        if (this.env.cameraPauseTimeout !== 0) {
          this.motionSubscription = this.deviceMotion.watchAcceleration({ frequency: 1000 }).subscribe(
            async (acceleration: DeviceMotionAccelerationData) => {
              if (this.detectMotionless(acceleration.x, acceleration.y, acceleration.z)) {
                this.motionlessCount++;
                console.log("motionless detected =>", this.motionlessCount)
                if (this.motionlessCount > this.env.cameraPauseTimeout && this.cameraActive) {
                  await this.qrScanner.destroy().then(
                    async () => {
                      this.cameraActive = false;
                      this.pauseAlert = await this.alertController.create({
                        header: this.translate.instant("CAMERA_PAUSED"),
                        message: this.translate.instant("MSG.CAMERA_PAUSED"),
                        backdropDismiss: false,
                        cssClass: ['alert-bg'],
                        buttons: [
                          {
                            text: this.translate.instant("RESUME"),
                            handler: async () => {
                              if (this.pauseAlert) {
                                this.pauseAlert.dismiss();
                                this.pauseAlert = undefined;
                              }
                              this.motionX = Math.round(acceleration.x);
                              this.motionY = Math.round(acceleration.y);
                              this.motionZ = Math.round(acceleration.z);
                              this.motionlessCount = 0;
                              const showing = (await this.qrScanner.getStatus()).showing;
                              const previewing = (await this.qrScanner.getStatus()).previewing;
                              if (!showing || !previewing) {
                                this.motionSubscription.unsubscribe();
                                await this.prepareScanner();
                              }
                            }
                          }
                        ]
                      })
                      this.pauseAlert.onDidDismiss().then(
                        () => {
                          this.pauseAlert = undefined;
                        }
                      );
                      await this.pauseAlert.present();
                    }
                  );
                }
              } else {
                console.log("motion detected!")
                if (this.pauseAlert) {
                  this.pauseAlert.dismiss();
                  this.pauseAlert = undefined;
                }
                this.motionX = Math.round(acceleration.x);
                this.motionY = Math.round(acceleration.y);
                this.motionZ = Math.round(acceleration.z);
                this.motionlessCount = 0;
                const showing = (await this.qrScanner.getStatus()).showing;
                const previewing = (await this.qrScanner.getStatus()).previewing;
                if (!showing || !previewing) {
                  this.motionSubscription.unsubscribe();
                  await this.prepareScanner();
                }
              }
            }
          );
        } else {
          console.log("the motion detect is disabled!")
        }
        this.scanSubscription = this.qrScanner.scan().subscribe(
          async (text: string) => {
            if (text === undefined || text === null || (text && text.trim().length <= 0) || text === "") {
              this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), 1000, "middle", "center", "long");
              this.scanQr();
              return;
            }
            if (this.env.vibration === 'on' || this.env.vibration === 'on-scanned') {
              await Haptics.vibrate();
            }
            const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
            if (this.scanSubscription) {
              this.scanSubscription.unsubscribe();
            }
            if (this.motionSubscription) {
              this.motionSubscription.unsubscribe();
              this.motionSubscription = null;
              this.motionlessCount = 0;
            }
            await this.processQrCode(text, loading);
          }
        );
      }
    );
  }

  private detectMotionless(x: number, y: number, z: number) {
    return (Math.round(x) - this.motionX === 0) && (Math.round(y) - this.motionY === 0) && (Math.round(z) - this.motionZ === 0) && (Math.round(z) === 10);
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
      await this.qrScanner.enableLight().then(
        () => {
          this.flashActive = true;
          this.cameraActive = true;
        }
      );
    } else {
      await this.qrScanner.disableLight().then(
        () => {
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
