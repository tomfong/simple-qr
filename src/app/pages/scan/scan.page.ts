import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AlertController, IonRouterOutlet, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { EnvService } from 'src/app/services/env.service';

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

  constructor(
    private platform: Platform,
    private qrScanner: QRScanner,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public routerOutlet: IonRouterOutlet,
    private deviceMotion: DeviceMotion,
    private vibration: Vibration,
    private router: Router,
    private env: EnvService,
    public translate: TranslateService,
    private splashScreen: SplashScreen,
  ) {
    this.platform.ready().then(
      async () => {
        this.platform.backButton.subscribeWithPriority(-1, async () => {
          if (!this.routerOutlet.canGoBack()) {
            await this.confirmExitApp();
          }
        });
        this.platform.pause.subscribe(
          async () => {
            await this.qrScanner.destroy().then(
              () => {
                this.cameraActive = false;
                if (this.motionSubscription) {
                  this.motionSubscription.unsubscribe();
                  this.motionSubscription = undefined;
                  this.motionlessCount = 0;
                }
              }
            );
          }
        );
        this.platform.resume.subscribe(
          async () => {
            await this.prepareScanner();
          }
        )
      }
    );
  }

  async ionViewDidEnter(): Promise<void> {
    setTimeout(
      () => {
        this.splashScreen.hide();
      }, 100
    );
    this.qrScanner.disableLight().then(
      () => {
        this.flashActive = false;
      }
    );
    await this.prepareScanner();
  }

  async ionViewDidLeave(): Promise<void> {
    this.vibration.vibrate(0);
    this.platform.resume.unsubscribe();
    this.platform.pause.unsubscribe();
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
      this.scanSubscription = undefined;
    }
    if (this.motionSubscription) {
      this.motionSubscription.unsubscribe();
      this.motionSubscription = undefined;
      this.motionlessCount = 0;
    }
    if (this.cameraActive) {
      await this.qrScanner.destroy().then(
        () => {
          this.cameraActive = false;
        }
      );
    }
  }

  async prepareScanner(): Promise<void> {
    const loading = await this.presentLoading(this.translate.instant("PREPARING"));
    let denied = false;
    await this.qrScanner.getStatus().then(
      async (status: QRScannerStatus) => {
        if (status.denied) {
          loading.dismiss();
          const alert = await this.presentAlert(
            this.translate.instant("MSG.CAMERA_PERMISSION_1"),
            this.translate.instant("MESSAGE"),
            this.translate.instant("SETTING")
          );
          await alert.onDidDismiss().then(
            async () => {
              denied = true;
            }
          );
        }
      },
    );
    if (denied) {
      loading.dismiss();
      this.qrScanner.openSettings();
      return;
    }
    await this.qrScanner.prepare().then(
      async (status: QRScannerStatus) => {
        loading.dismiss();
        if (status.authorized) {
          await this.scanQr();
        }
      },
      async err => {
        loading.dismiss();
        if (err.name === "CAMERA_ACCESS_DENIED") {
          const alert = await this.presentAlert(
            this.translate.instant("MSG.CAMERA_PERMISSION_2"),
            this.translate.instant("MESSAGE"),
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
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
    }
    if (this.motionSubscription) {
      this.motionSubscription.unsubscribe();
      this.motionSubscription = null;
      this.motionlessCount = 0;
    }
    if (this.pauseAlert) {
      this.pauseAlert.dismiss();
      this.pauseAlert = null;
    }
    // await this.qrScanner.useCamera(this.cameraChoice);
    await this.qrScanner.show().then(
      () => {
        this.cameraActive = true;
        if (this.env.cameraPauseTimeout !== 0) {
          this.motionSubscription = this.deviceMotion.watchAcceleration({ frequency: 1000 }).subscribe(
            async (acceleration: DeviceMotionAccelerationData) => {
              if (this.detectMotionless(acceleration.x, acceleration.y, acceleration.z)) {
                this.motionlessCount++;
                console.log("motionless detected =>",this.motionlessCount)
                if (this.motionlessCount > this.env.cameraPauseTimeout && this.cameraActive) {
                  await this.qrScanner.destroy().then(
                    async () => {
                      this.cameraActive = false;
                      this.pauseAlert = await this.presentAlert(
                        this.translate.instant("MSG.CAMERA_PAUSED"),
                        this.translate.instant("CAMERA_PAUSED"),
                        null,
                        true
                      );
                      this.pauseAlert.onDidDismiss().then(
                        () => {
                          this.pauseAlert = null;
                        }
                      );
                    }
                  );
                }
              } else {
                console.log("motion detected!")
                if (this.pauseAlert) {
                  this.pauseAlert.dismiss();
                  this.pauseAlert = null;
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
            this.vibration.vibrate(200);
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
    this.router.navigate(['result', { t: new Date().getTime() }]).then(
      () => {
        loading.dismiss();
      }
    );
  }

  async createQrcode(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('GENERATE_QRCODE'),
      inputs: [
        {
          name: 'qrcode',
          type: 'text',
          placeholder: this.translate.instant('QRCODE_CONTENT')
        },
      ],
      buttons: [
        {
          text: this.translate.instant('ENTER'),
          handler: async (data) => {
            const text = data.qrcode;
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
        }
      ]
    });
    alert.present();
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

  async navigateHistory(): Promise<void> {
    this.router.navigate(['history', { t: new Date().getTime() }]);
  }

  async navigateSetting(): Promise<void> {
    this.router.navigate(['setting', { t: new Date().getTime() }]);
  }

  async confirmExitApp(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('EXIT_APP'),
      message: this.translate.instant('MSG.EXIT_APP'),
      buttons: [
        {
          text: this.translate.instant('YES'),
          handler: () => {
            navigator['app'].exitApp();
          }
        },
        {
          text: this.translate.instant('NO'),
          role: 'cancel',
          cssClass: 'btn-inverse'
        }
      ]
    });
    await alert.present();
  }

  async presentAlert(msg: string, head: string, buttonText: string, buttonless: boolean = false): Promise<HTMLIonAlertElement> {
    let alert: any;
    if (!buttonless) {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [buttonText]
      });
    } else {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [],
        backdropDismiss: false
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

}
