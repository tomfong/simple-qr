import { Component } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Camera } from '@ionic-native/camera/ngx';
import jsQR from 'jsqr';
import { Router } from '@angular/router';

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
    private camera: Camera,
    private router: Router,
  ) { }

  async importImage() {
    const getPictureLoading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    const options = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    };
    await this.camera.getPicture(options).then(
      async (imageDataUrl) => {
        getPictureLoading.dismiss();
        const decodingLoading = await this.presentLoading(this.translate.instant('DECODING'));
        await this.convertDataUrlToImageData(imageDataUrl).then(
          async imageData => {
            await this.getJsQr(imageData.imageData.data, imageData.width, imageData.height).then(
              async qrValue => {
                decodingLoading.dismiss();
                const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
                await this.processQrCode(qrValue, loading);
              },
              async err => {
                decodingLoading.dismiss();
                this.presentToast(this.translate.instant("MSG.NO_QR_CODE"), 2000, "middle", "center", "long");
              }
            )
          },
          async err => {
            decodingLoading.dismiss();
            this.presentToast(this.translate.instant("MSG.NO_QR_CODE"), 2000, "middle", "center", "long");
          }
        );
      },
      async err => {
        getPictureLoading.dismiss();
        if (err === 20) {
          await this.presentAlert(
            this.translate.instant("MSG.READ_IMAGE_PERMISSION"),
            this.translate.instant("PERMISSION_REQUIRED"),
            this.translate.instant("OK")
          );
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

}