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

@Component({
  selector: 'app-import-image',
  templateUrl: './import-image.page.html',
  styleUrls: ['./import-image.page.scss'],
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

  async importImage() {
    const getPictureLoading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    const options = {
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    } as ImageOptions;
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
              async err => {
                decodingLoading.dismiss();
                await this.presentToast(this.translate.instant("MSG.NO_QR_CODE"), "short", "bottom");
              }
            )
          },
          async err => {
            decodingLoading.dismiss();
            await this.presentToast(this.translate.instant("MSG.NO_QR_CODE"), "short", "bottom");
          }
        );
      },
      async err => {
        getPictureLoading.dismiss();
        if (err?.message != null && err?.message == 'User denied access to photos') {
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
                text: this.translate.instant("OK"),
                handler: () => {
                  return true;
                }
              }
            ],
            cssClass: ['alert-bg']
          });
          await alert.present();
        }
      }
    );
  }

  async processQrCode(scannedData: string, loading: HTMLIonLoadingElement): Promise<void> {
    this.env.result = scannedData;
    this.env.resultFormat = "QR_CODE";
    this.router.navigate(['tabs/result', { from: 'import-image', t: new Date().getTime() }]).then(
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

  private async convertDataUrlToImageData(uri: string): Promise<{ imageData: ImageData, width: number, height: number }> {
    return await new Promise((resolve, reject) => {
      if (uri == null) return reject();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.addEventListener('load', function () {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ imageData: context.getImageData(0, 0, canvas.width, canvas.height), width: image.width, height: image.height });
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
      const qrcode = jsQR(imageData, width, height, { inversionAttempts: "dontInvert" });
      if (qrcode) {
        return resolve(qrcode.data);
      } else {
        return reject();
      }
    });
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }
}
