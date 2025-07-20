import { Component } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Camera, CameraResultType, CameraSource, GalleryImageOptions, GalleryPhotos, ImageOptions, Photo } from '@capacitor/camera';
import jsQR from 'jsqr';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
    selector: 'app-import-image',
    templateUrl: './import-image.page.html',
    styleUrls: ['./import-image.page.scss'],
    standalone: false
})
export class ImportImagePage {

  constructor(
    private translate: TranslateService,
    public env: EnvService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
  ) { }

  async ionViewDidEnter() {
    await SplashScreen.hide()
  }

  async importImage() {
    const getPictureLoading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    const options = {
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    } as ImageOptions;
    await Camera.requestPermissions({ permissions: ['photos'] }).then(
      async permissionResult => {
        if (permissionResult.photos === 'granted' || permissionResult.photos === 'limited') {
          await Camera.getPhoto(options).then(
            async (photo: Photo) => {
              getPictureLoading.dismiss();
              const decodingLoading = await this.presentLoading(this.translate.instant('DECODING'));
              await this.convertDataUrlToImageData(photo?.dataUrl ?? '').then(
                async imageData => {
                  await this.getJsQr(imageData.imageData.data, imageData.width, imageData.height).then(
                    async qrValue => {
                      decodingLoading.dismiss();
                      const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
                      await this.processQrCode(qrValue, loading);
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
        } else {
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
        }
      },
      async err => {
        getPictureLoading.dismiss();
        if (this.env.debugMode === 'on') {
          await Toast.show({ text: 'Err when Camera.requestPermissions: ' + JSON.stringify(err), position: "bottom", duration: "long" })
        } else {
          Toast.show({ text: 'Unknown Error', position: "bottom", duration: "short" })
        }
      }
    );
  }

  async processQrCode(scannedData: string, loading: HTMLIonLoadingElement): Promise<void> {
    this.env.resultContent = scannedData;
    this.env.resultContentFormat = "QR_CODE";
    this.env.recordSource = "scan";
    this.env.detailedRecordSource = "scan-image";
    this.env.viewResultFrom = "/tabs/import-image";
    this.router.navigate(['tabs/result']).then(
      () => {
        loading.dismiss();
      }
    );
  }

  async presentAlert(msg: string, head: string, buttonText: string, buttonless: boolean = false): Promise<HTMLIonAlertElement> {
    let alert: any;
    if (!buttonless) {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        cssClass: ['alert-bg'],
        buttons: [buttonText]
      });
    } else {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [],
        cssClass: ['alert-bg'],
        backdropDismiss: false
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
