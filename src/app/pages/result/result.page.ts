import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { ConfigService } from 'src/app/services/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  contentType: "freeText" | "url" | "contact" | "phone" | "sms" | "email" = "freeText";

  qrCodeContent: string;
  qrElementType: NgxQrcodeElementTypes = NgxQrcodeElementTypes.CANVAS;
  errorCorrectionLevel: NgxQrcodeErrorCorrectionLevels = NgxQrcodeErrorCorrectionLevels.LOW;
  qrMargin: number = 3;

  base64Decoded: boolean = false;
  base64DecodedText: string = "";

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private route: ActivatedRoute,
    private vibration: Vibration,
    private router: Router,
    public config: ConfigService,
    public toastController: ToastController,
    private clipboard: Clipboard,
    private file: File,
    private socialSharing: SocialSharing,
  ) { }

  ngOnInit() {
    this.qrCodeContent = this.route.snapshot.paramMap.get("qrCodeContent");
    this.setContentType();
  }

  ionViewDidEnter(): void {
    if (this.platform.is("android")) {
      this.vibration.vibrate([100,100,100]);
    } else {
      this.vibration.vibrate(100);
    }
  }

  ionViewWillLeave(): void {
    this.vibration.vibrate(0);
    this.base64Decoded = false;
  }

  setContentType(): void {
    const urlPrefix1 = "https://";
    const urlPrefix2 = "http://";
    const contactPrefix = "BEGIN:VCARD";
    const phonePrefix = "tel:";
    const smsPrefix = "smsto:";
    const emailPrefix = "mailto:";
    if (this.qrCodeContent.trim().toLowerCase().substr(0,urlPrefix1.length) === urlPrefix1 || this.qrCodeContent.trim().toLowerCase().substr(0,urlPrefix2.length) === urlPrefix2) {
      this.contentType = "url";
    } else if (this.qrCodeContent.trim().substr(0,contactPrefix.length) === contactPrefix) {
      this.contentType = "contact";
    } else if (this.qrCodeContent.trim().toLowerCase().substr(0,phonePrefix.length) === phonePrefix) {
      this.contentType = "phone";
    } else if (this.qrCodeContent.trim().toLowerCase().substr(0,smsPrefix.length) === smsPrefix) {
      this.contentType = "sms";
    } else if (this.qrCodeContent.trim().toLowerCase().substr(0,emailPrefix.length) === emailPrefix) {
      this.contentType = "email";
    } else {
      this.contentType = "freeText";
    }
  }

  get qrColorDark(): string {
    return this.config.darkTheme? "#ffffff" : "#222428";
  }

  get qrColorLight(): string {
    return this.config.darkTheme? "#222428" : "#ffffff";
  }

  async webSearch(): Promise<void> {
    let url: string;
    if (this.base64Decoded) {
      const alert = await this.alertController.create(
        {
          header: "Search",
          message: "Which content do you want to search for?",
          buttons: [
            {
              text: 'Original',
              handler: () => {
                alert.dismiss();
                url = environment.webSearchUrl + encodeURIComponent(this.qrCodeContent);
                window.open(url, '_system');
              }
            },
            {
              text: 'Base64-Decoded',
              handler: () => {
                alert.dismiss();
                url = environment.webSearchUrl + encodeURIComponent(this.base64DecodedText);
                window.open(url, '_system');
              }
            }
          ]
        }
      )
      alert.present();
    } else {
      url = environment.webSearchUrl + encodeURIComponent(this.qrCodeContent);
      window.open(url, '_system');
    }
  }

  async copyText(): Promise<void> {
    if (this.base64Decoded) {
      const alert = await this.alertController.create(
        {
          header: "Copy",
          message: "Which content do you want to copy?",
          buttons: [
            {
              text: 'Original',
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.qrCodeContent).then(
                  async () => {
                    await this.presentToast("Copied", 1500, "bottom", "short");
                  }
                )
              }
            },
            {
              text: 'Base64-Decoded',
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.base64DecodedText).then(
                  async () => {
                    await this.presentToast("Copied", 1500, "bottom", "short");
                  }
                )
              }
            }
          ]
        }
      )
      alert.present();
    } else {
      await this.clipboard.copy(this.qrCodeContent).then(
        async () => {
          await this.presentToast("Copied", 1500, "bottom", "short");
        }
      )
    }
  }

  async base64Decode(): Promise<void> {
    try {
      this.base64DecodedText = atob(this.qrCodeContent ? this.qrCodeContent : "");
      this.base64Decoded = true;
      await this.presentToast("Decoded", 1500, "bottom", "short");
    } catch (err) {
      this.base64Decoded = false;
      await this.presentToast("Data is not Base64 encoded", 2000, "middle", "long");
    }
  }

  async saveQrCode(): Promise<void> {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const imageDataUrl = canvas.toDataURL("image/png", 1);
    // const data = imageDataUrl.split(',')[1];
    // const blob = this.base64toBlob(data, 'image/png');
    // const filename = "qrcode_" + (new Date()).getTime() + '.png';
    await this.socialSharing.share('QR Code generated by Simple QR Scanner', 'Simple QR Scanner', imageDataUrl, null);
  }

  returnScanPage(): void {
    this.router.navigate(['/scan'], { replaceUrl: true });
  }

  async presentToast(msg: string, msTimeout: number, pos: "top" | "middle" | "bottom", size: "short" | "long" ) {
    if (size === "long") {
      const toast = await this.toastController.create({
        message: msg,
        duration: msTimeout,
        mode: "ios",
        color: "light",
        cssClass: "text-center-toast",
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

  private base64toBlob(base64Data: string, contentType: string): Blob {
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: contentType });
    return blob;
  }

}
