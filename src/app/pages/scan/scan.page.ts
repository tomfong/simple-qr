import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AlertController, IonRouterOutlet, LoadingController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
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
    public config: ConfigService,
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
                  this.motionSubscription = null;
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
    this.qrScanner.disableLight().then(
      () => {
        this.flashActive = false;
      }
    );
    await this.prepareScanner();
  }

  async ionViewWillLeave(): Promise<void> {
    this.vibration.vibrate(0);
    this.platform.resume.unsubscribe();
    this.platform.pause.unsubscribe();
    if (this.cameraActive) {
      await this.qrScanner.destroy().then(
        () => {
          this.cameraActive = false;
        }
      );
    }
    if (this.scanSubscription) {
      this.scanSubscription.unsubscribe();
    }
    if (this.motionSubscription) {
      this.motionSubscription.unsubscribe();
      this.motionSubscription = null;
      this.motionlessCount = 0;
    }
  }

  async prepareScanner(): Promise<void> {
    const loading = await this.presentLoading("Preparing");
    let denied = false;
    await this.qrScanner.getStatus().then(
      async (status: QRScannerStatus) => {
        loading.dismiss();
        if (status.denied) {
          const alert = await this.presentAlert("Press Setting to grant camera permission.", "Message", "Setting");
          await alert.onDidDismiss().then(
            async () => {
              denied = true;
            }
          );
        }
      },
    );
    if (denied) {
      this.qrScanner.openSettings();
      return;
    }
    await this.qrScanner.prepare().then(
      async (status: QRScannerStatus) => {
        if (status.authorized) {
          await this.scanQr();
        }
      },
      async err => {
        if (err.name === "CAMERA_ACCESS_DENIED") {
          const alert = await this.presentAlert("You must grant the camera permission for scanning.", "Message", "OK");
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
    await this.qrScanner.useCamera(this.cameraChoice);
    await this.qrScanner.show().then(
      () => {
        this.cameraActive = true;
        this.motionSubscription = this.deviceMotion.watchAcceleration({ frequency: 1000 }).subscribe(
          async (acceleration: DeviceMotionAccelerationData) => {
            if (this.detectMotionless(acceleration.x, acceleration.y, acceleration.z)) {
              this.motionlessCount++;
              if (this.motionlessCount > 30 && this.cameraActive) {
                await this.qrScanner.destroy().then(
                  async () => {
                    this.cameraActive = false;
                    this.pauseAlert = await this.presentAlert("The camera is paused to save battery. Hold the device to resume.", "Camera Pause", null, true);
                    this.pauseAlert.onDidDismiss().then(
                      () => {
                        this.pauseAlert = null;
                      }
                    );
                  }
                );
              }
            } else {
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
        this.scanSubscription = this.qrScanner.scan().subscribe(
          async (text: string) => {
            this.vibration.vibrate(200);
            const loading = await this.presentLoading("Please wait...");
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
      header: "Generate QR Code",
      inputs: [
        {
          name: 'qrcode',
          type: 'text',
          placeholder: 'QR code content...'
        },
      ],
      buttons: [
        {
          text: 'Enter',
          handler: async (data) => {
            const text = data.qrcode;
            const loading = await this.presentLoading("Please wait...");
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

  }

  async confirmExitApp(): Promise<void> {
    const alert = await this.alertController.create({
      header: "Exit the app",
      message: "Do you want to leave now?",
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            navigator['app'].exitApp();
          }
        },
        {
          text: 'No',
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
