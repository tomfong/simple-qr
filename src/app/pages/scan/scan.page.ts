import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, InputCustomEvent, IonRouterOutlet, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import jsQR from 'jsqr';
import { Capacitor } from '@capacitor/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: false
})
export class ScanPage {

  @ViewChild('content') contentEl: HTMLIonContentElement;

  cameraActive: boolean = false;
  flashActive: boolean = false;

  permissionAlert: HTMLIonAlertElement;

  isTorchAvailable: boolean = false;

  minZoomRatio: number | undefined;
  maxZoomRatio: number | undefined;
  zoomRatio: number = 0;

  @ViewChild('square')
  public squareElement: ElementRef<HTMLDivElement> | undefined;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public routerOutlet: IonRouterOutlet,
    private router: Router,
    public env: EnvService,
    public translate: TranslateService,
    private readonly ngZone: NgZone,
    private platform: Platform,
  ) { }

  ionViewWillEnter() {
    // if (this.contentEl != null) {
    //   this.contentEl.color = "darker";
    // }
  }

  async ionViewDidEnter(): Promise<void> {
    await SplashScreen.hide()
    if (this.platform.is('android')) {
      await EdgeToEdge.setBackgroundColor({ color: '#000000' });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    }
    await this.prepareScanner();
  }

  async ionViewWillLeave() {
    if (this.platform.is('android')) {
      await EdgeToEdge.enable();
    }
  }

  async ionViewDidLeave(): Promise<void> {
    try {
      const { available } = await BarcodeScanner.isTorchAvailable();
      if (available) {
        const { enabled } = await BarcodeScanner.isTorchEnabled();
        if (enabled) {
          await BarcodeScanner.disableTorch();
        }
        this.flashActive = false;
      }
    } catch { }
    await this.stopScannerUsingMlkitModule();
  }

  async stopScannerUsingMlkitModule(): Promise<void> {
    document.querySelector('body')?.classList.remove('barcode-scanning-active');
    await BarcodeScanner.stopScan();
    this.cameraActive = false;
    BarcodeScanner.isTorchAvailable().then(async result => {
      this.isTorchAvailable = result.available;
      if (this.isTorchAvailable) {
        const { enabled } = await BarcodeScanner.isTorchEnabled();
        if (enabled) {
          await BarcodeScanner.disableTorch();
        }
        this.flashActive = false;
      }
    })
  }

  async prepareScanner(): Promise<void> {
    const cameraPermissions = await BarcodeScanner.checkPermissions();
    if (cameraPermissions.camera === 'granted') {
      BarcodeScanner.isTorchAvailable().then(async result => {
        this.isTorchAvailable = result.available;
        if (this.isTorchAvailable) {
          const { enabled } = await BarcodeScanner.isTorchEnabled();
          if (enabled) {
            await BarcodeScanner.disableTorch();
          }
          this.flashActive = false;
        }
      })
      await this.scanQrUsingMlkitModule();
    } else {
      const cameraPermissions2 = await BarcodeScanner.requestPermissions();
      if (cameraPermissions2.camera === 'granted' || cameraPermissions2.camera === "limited") {
        BarcodeScanner.isTorchAvailable().then(async result => {
          this.isTorchAvailable = result.available;
          if (this.isTorchAvailable) {
            const { enabled } = await BarcodeScanner.isTorchEnabled();
            if (enabled) {
              await BarcodeScanner.disableTorch();
            }
            this.flashActive = false;
          }
        })
        await this.scanQrUsingMlkitModule();
      } else {
        this.permissionAlert = await this.alertController.create({
          header: this.translate.instant("PERMISSION_REQUIRED"),
          message: this.translate.instant("MSG.CAMERA_PERMISSION"),
          buttons: [
            {
              text: this.translate.instant("SETTING"),
              handler: () => {
                BarcodeScanner.openSettings();
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
  }

  async scanQrUsingMlkitModule(): Promise<void> {
    await this.stopScannerUsingMlkitModule();
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const options: StartScanOptions = {
      formats: [
        BarcodeFormat.Aztec,
        BarcodeFormat.Codabar,
        BarcodeFormat.Code128,
        BarcodeFormat.Code39,
        BarcodeFormat.Code93,
        BarcodeFormat.DataMatrix,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
        BarcodeFormat.Itf,
        BarcodeFormat.Pdf417,
        BarcodeFormat.QrCode,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE
      ],
      lensFacing: LensFacing.Back
    };

    const squareElementBoundingClientRect =
      this.squareElement?.nativeElement.getBoundingClientRect();
    const scaledRect = squareElementBoundingClientRect
      ? {
        left: squareElementBoundingClientRect.left * window.devicePixelRatio,
        right:
          squareElementBoundingClientRect.right * window.devicePixelRatio,
        top: squareElementBoundingClientRect.top * window.devicePixelRatio,
        bottom:
          squareElementBoundingClientRect.bottom * window.devicePixelRatio,
        width:
          squareElementBoundingClientRect.width * window.devicePixelRatio,
        height:
          squareElementBoundingClientRect.height * window.devicePixelRatio,
      }
      : undefined;
    const detectionCornerPoints = scaledRect
      ? [
        [scaledRect.left, scaledRect.top],
        [scaledRect.left + scaledRect.width, scaledRect.top],
        [
          scaledRect.left + scaledRect.width,
          scaledRect.top + scaledRect.height,
        ],
        [scaledRect.left, scaledRect.top + scaledRect.height],
      ]
      : undefined;

    const listener = await BarcodeScanner.addListener(
      'barcodesScanned',
      async (event) => {
        this.ngZone.run(
          async () => {
            const firstBarcode = event.barcodes[0];
            if (!firstBarcode) {
              return;
            }
            const cornerPoints = firstBarcode.cornerPoints;
            if (
              detectionCornerPoints &&
              cornerPoints
            ) {
              if (
                detectionCornerPoints[0][0] > cornerPoints[0][0] ||
                detectionCornerPoints[0][1] > cornerPoints[0][1] ||
                detectionCornerPoints[1][0] < cornerPoints[1][0] ||
                detectionCornerPoints[1][1] > cornerPoints[1][1] ||
                detectionCornerPoints[2][0] < cornerPoints[2][0] ||
                detectionCornerPoints[2][1] < cornerPoints[2][1] ||
                detectionCornerPoints[3][0] > cornerPoints[3][0] ||
                detectionCornerPoints[3][1] < cornerPoints[3][1]
              ) {
                return;
              }
            }
            listener.remove();
            const text = firstBarcode.rawValue;
            if (text == null || text?.trim()?.length <= 0 || text == "") {
              this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), "short", "center");
              this.scanQrUsingMlkitModule();
              return;
            }
            if (this.env.vibration === 'on' || this.env.vibration === 'on-scanned') {
              await Haptics.vibrate({ duration: 100 })
                .catch(async err => {
                  if (this.env.debugMode === 'on') {
                    await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
                  }
                })
            }
            this.processQrCode(text, firstBarcode.format);
          });
      },
    );
    await NavigationBar.setTransparency({ isTransparent: false });
    await NavigationBar.setColor({ color: '#000000', darkButtons: false });
    await BarcodeScanner.startScan(options);
    if (Capacitor.getPlatform() !== 'web') {
      BarcodeScanner.getMinZoomRatio().then(async (result) => {
        this.minZoomRatio = result.zoomRatio;
        await BarcodeScanner.setZoomRatio({
          zoomRatio: parseInt(this.minZoomRatio as any, 10),
        });
        this.zoomRatio = this.minZoomRatio;
      });
      BarcodeScanner.getMaxZoomRatio().then((result) => {
        this.maxZoomRatio = result.zoomRatio;
      });
    }
  }

  async setZoomRatio(event: InputCustomEvent) {
    if (!this.zoomRatio) {
      return;
    }
    await BarcodeScanner.setZoomRatio({
      zoomRatio: parseInt(this.zoomRatio as any, 10),
    });
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
                    BarcodeScanner.openSettings();
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
    try {
      const { available } = await BarcodeScanner.isTorchAvailable();
      if (available) {
        const { enabled } = await BarcodeScanner.isTorchEnabled();
        if (enabled) {
          await BarcodeScanner.disableTorch();
          this.flashActive = false;
        } else {
          await BarcodeScanner.enableTorch();
          this.flashActive = true;
        }
      }
    } catch { }
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
