import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { ConfigService } from 'src/app/services/config.service';

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

  baseDecoded: boolean = false;
  baseDecodedText: string = "";

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private route: ActivatedRoute,
    private vibration: Vibration,
    private router: Router,
    public config: ConfigService,
    public toastController: ToastController,
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
    this.baseDecoded = false;
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

  async base64Decode(): Promise<void> {
    try {
      this.baseDecodedText = atob(this.qrCodeContent ? this.qrCodeContent : "");
      this.baseDecoded = true;
    } catch (err) {
      await this.presentToast("Data is not Base64 encoded", 2000, "middle");
    }
  }

  returnScanPage(): void {
    this.router.navigate(['/scan'], { replaceUrl: true });
  }

  async presentToast(msg: string, msTimeout: number, pos: "top" | "middle" | "bottom") {
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

}
