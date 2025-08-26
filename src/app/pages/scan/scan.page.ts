import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner, ScanResult } from '@capacitor-community/barcode-scanner';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, IonRouterOutlet, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import jsQR from 'jsqr';

enum CameraChoice {
  BACK,
  FRONT
}

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: false
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
    const torchState = await BarcodeScanner.getTorchState();
    if (torchState.isEnabled) {
      await BarcodeScanner.disableTorch().then(
        _ => {
          this.flashActive = false;
        }
      ).catch(_ => { });
    }
    await this.prepareScanner();
  }

  async ionViewDidLeave(): Promise<void> {
    const torchState = await BarcodeScanner.getTorchState();
    if (torchState.isEnabled) {
      await BarcodeScanner.disableTorch().catch(_ => { });
    }
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
            text: this.translate.instant("CLOSE"),
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
          if (text == null || text?.trim()?.length <= 0 || text == "") {
            this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), "short", "center");
            this.scanQr();
            return;
          }
          if (this.contentEl != null) {
            this.contentEl.color = "darker";
          }
          if (this.env.vibration === 'on' || this.env.vibration === 'on-scanned') {
            await Haptics.vibrate({ duration: 100 })
              .catch(async err => {
                if (this.env.debugMode === 'on') {
                  await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
                }
              })
          }
          this.processQrCode(text, result.format);
        } else {
          this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), "short", "center");
          this.scanQr();
          return;
        }
      }
    );
  }

  async scanFromImage() {
    const getPictureLoading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    const options = {
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      saveToGallery: false
    } as ImageOptions;
    const cameraPermissions = await Camera.checkPermissions();
    if (!(cameraPermissions.photos == "granted" || cameraPermissions.photos == "limited")) {
      await Camera.requestPermissions({ permissions: ['photos'] }).then(
        async permissionResult => {
          if (!(permissionResult.photos == "granted" || permissionResult.photos == "limited")) {
            getPictureLoading.dismiss();
            const alert = await this.alertController.create({
              header: this.translate.instant("PERMISSION_REQUIRED"),
              message: this.translate.instant("MSG.READ_IMAGE_PERMISSION"),
              buttons: [
                {
                  text: this.translate.instant("SETTING"),
                  handler: () => {
                    BarcodeScanner.openAppSettings();
                    return true;
                  }
                },
                {
                  text: this.translate.instant("CLOSE"),
                  handler: () => {
                    return true;
                  }
                }
              ],
              cssClass: ['alert-bg']
            });
            await alert.present();
            return;
            // TODO: return from scanFromImage()
          }
        },
        async err => {
          getPictureLoading.dismiss();
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Camera.requestPermissions: ' + JSON.stringify(err), position: "bottom", duration: "long" })
          } else {
            Toast.show({ text: 'Unknown Error', position: "bottom", duration: "short" })
          }
          return;
        });
    }
    await Camera.getPhoto(options).then(
      async (photo: Photo) => {
        getPictureLoading.dismiss();
        const decodingLoading = await this.presentLoading(this.translate.instant('DECODING'));
        await this.convertDataUrlToImageData(photo?.dataUrl ?? '').then(
          async imageData => {
            await this.getJsQr(imageData.imageData.data, imageData.width, imageData.height).then(
              async qrValue => {
                decodingLoading.dismiss();
                this.processQrCode(qrValue, "QR_CODE");
              },
              async _ => {
                decodingLoading.dismiss();
                await this.presentToast(this.translate.instant("MSG.NO_QR_CODE"), "short", "center");
              }
            )
          },
          async _ => {
            decodingLoading.dismiss();
            await this.presentToast(this.translate.instant("MSG.NO_QR_CODE"), "short", "center");
          }
        );
      },
      async err => {
        getPictureLoading.dismiss();
        if (this.env.isDebugging) {
          this.presentToast("Error when call Camera.getPhoto: " + JSON.stringify(err), "long", "top");
        }
      }
    );
  }

  private async convertDataUrlToImageData(uri: string): Promise<{ imageData: ImageData, width: number, height: number }> {
    return await new Promise((resolve, reject) => {
      if (uri == null) return reject();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.addEventListener('load', function () {
        canvas.width = image.width;
        canvas.height = image.height;
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = avg;
          imageData.data[i + 1] = avg;
          imageData.data[i + 2] = avg;
        }
        const width = image.width;
        const height = image.height;
        resolve({ imageData: imageData, width: width, height: height });
      }, false);
      if (uri.startsWith("data")) {
        image.src = uri;
      } else {
        image.src = "data:image/png;base64," + uri;
      }
    });
  }

  private async getJsQr(imageData: Uint8ClampedArray, width: number, height: number): Promise<string> {
    return await new Promise((resolve, reject) => {
      const qrcode = jsQR(imageData, width, height, { inversionAttempts: "attemptBoth" });
      if (qrcode) {
        return resolve(qrcode.data);
      } else {
        return reject();
      }
    });
  }

  processQrCode(scannedData: string, format: string,) {
    this.env.resultContent = scannedData
    this.env.resultContentFormat = format;
    this.env.recordSource = "scan";
    this.env.detailedRecordSource = "scan-camera";
    this.env.viewResultFrom = "/tabs/scan";
    this.router.navigate(['tabs/result']);
  }

  async toggleFlash(): Promise<void> {
    if (!this.flashActive) {
      await BarcodeScanner.enableTorch().then(
        _ => {
          this.flashActive = true;
        }
      )
    } else {
      const torchState = await BarcodeScanner.getTorchState();
      if (torchState.isEnabled) {
        await BarcodeScanner.disableTorch().then(
          _ => {
            this.flashActive = false;
          }
        ).catch(_ => { });
      }
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
      await Haptics.impact({ style: ImpactStyle.Light })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }
}
