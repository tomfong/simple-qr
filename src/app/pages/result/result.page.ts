import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AlertController, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { CreateContactPage } from 'src/app/modals/create-contact/create-contact.page';
import { VCardContact } from 'src/app/models/v-card-contact';
import { ConfigService } from 'src/app/services/config.service';
import { EnvService } from 'src/app/services/env.service';
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
  errorCorrectionLevel: NgxQrcodeErrorCorrectionLevels = NgxQrcodeErrorCorrectionLevels.HIGH;
  qrMargin: number = 3;

  phoneNumber: string;
  vCardContact: VCardContact;

  base64Decoded: boolean = false;
  base64DecodedText: string = "";

  webToast: HTMLIonToastElement;

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private route: ActivatedRoute,
    private vibration: Vibration,
    private router: Router,
    public config: ConfigService,
    public env: EnvService,
    public toastController: ToastController,
    private clipboard: Clipboard,
    private file: File,
    private socialSharing: SocialSharing,
    private webview: WebView,
    private callNumber: CallNumber,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.qrCodeContent = this.env.result;
    this.setContentType();
  }

  async ionViewDidEnter(): Promise<void> {
    if (this.platform.is("android")) {
      this.vibration.vibrate([100, 100, 100]);
    } else {
      this.vibration.vibrate(100);
    }
    if (this.contentType === "url") {
      this.webToast = await this.toastController.create({
        header: "Website",
        message: `${this.qrCodeContent}`,
        duration: 7000,
        mode: "ios",
        color: "light",
        position: "top",
        buttons: [
          {
            text: 'Open',
            side: 'end',
            handler: () => {
              this.browseWebsite();
              this.webToast.dismiss();
            }
          }
        ]
      });
      this.webToast.present();
    }
  }

  async ionViewWillLeave(): Promise<void> {
    this.vibration.vibrate(0);
    this.base64Decoded = false;
    if (this.webToast) {
      this.webToast.dismiss();
    }
  }

  setContentType(): void {
    const urlPrefix1 = "https://";
    const urlPrefix2 = "http://";
    const contactPrefix = "BEGIN:VCARD";
    const phonePrefix = "tel:";
    const smsPrefix = "smsto:";
    const emailPrefix = "mailto:";
    if (this.qrCodeContent.trim().toLowerCase().substr(0, urlPrefix1.length) === urlPrefix1 || this.qrCodeContent.trim().toLowerCase().substr(0, urlPrefix2.length) === urlPrefix2) {
      this.contentType = "url";
    } else if (this.qrCodeContent.trim().substr(0, contactPrefix.length) === contactPrefix) {
      this.contentType = "contact";
      this.generateVCardContact();
    } else if (this.qrCodeContent.trim().toLowerCase().substr(0, phonePrefix.length) === phonePrefix) {
      this.contentType = "phone";
      this.phoneNumber = this.qrCodeContent.trim().toLowerCase().substr(phonePrefix.length);
    } else if (this.qrCodeContent.trim().toLowerCase().substr(0, smsPrefix.length) === smsPrefix) {
      this.contentType = "sms";
    } else if (this.qrCodeContent.trim().toLowerCase().substr(0, emailPrefix.length) === emailPrefix) {
      this.contentType = "email";
    } else {
      this.contentType = "freeText";
    }
  }

  get qrColorDark(): string {
    return this.config.darkTheme ? "#ffffff" : "#222428";
  }

  get qrColorLight(): string {
    return this.config.darkTheme ? "#222428" : "#ffffff";
  }

  get type(): string {
    switch (this.contentType) {
      case "freeText":
        return "Free Text";
      case "url":
        return "URL";
      case "contact":
        return "Contact Information";
      case "email":
        return "Email";
      case "phone":
        return "Phone Number";
      case "sms":
        return "SMS";
    }
  }

  browseWebsite(): void {
    window.open(this.qrCodeContent, '_system');
  }

  async addContact(): Promise<void> {
    let modal: HTMLIonModalElement;
    if (this.contentType === "contact") {
      modal = await this.modalController.create({
        component: CreateContactPage,
        cssClass: 'modal-page',
        componentProps: {
          vCardContact: this.vCardContact
        }
      });
    } else if (this.contentType === "phone") {
      modal = await this.modalController.create({
        component: CreateContactPage,
        cssClass: 'modal-page',
        componentProps: {
          phoneNumber: this.phoneNumber
        }
      });
    } else {
      modal = await this.modalController.create({
        component: CreateContactPage,
        cssClass: 'modal-page',
        componentProps: {}
      });
    }
    modal.onDidDismiss().then(
      async (result) => {
        if (result.data) {
          const data = result.data;
          if (!data.cancelled) {
            const contact = navigator.contacts.create({
              name: data.name,
              emails: [data.email],
              phoneNumbers: [data.phone]
            });
            contact.save(() => {
              this.presentToast("Saved", 2000, "bottom", "center", "short");
            }, err => {
              this.presentToast("Failed to save contact", 3000, "middle", "center", "long");
            })
          }
        }
      }
    );
    await modal.present();
  }

  async callPhone(): Promise<void> {
    const alert = await this.alertController.create({
      header: "Phone Call",
      message: `Are you sure to call ${this.phoneNumber} now?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            alert.dismiss();
            await this.callNumber.callNumber(this.phoneNumber, false).catch(
              async (err) => {
                this.presentToast("Failed to open dialer", 3000, "middle", "center", "long");
              }
            );
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
                    await this.presentToast("Copied", 1500, "bottom", "center", "short");
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
                    await this.presentToast("Copied", 1500, "bottom", "center", "short");
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
          await this.presentToast("Copied", 1500, "bottom", "center", "short");
        }
      )
    }
  }

  async base64Decode(): Promise<void> {
    try {
      this.base64DecodedText = atob(this.qrCodeContent ? this.qrCodeContent : "");
      this.base64Decoded = true;
      await this.presentToast("Decoded", 1500, "bottom", "center", "short");
    } catch (err) {
      this.base64Decoded = false;
      await this.presentToast("Data is not Base64 encoded", 2000, "middle", "center", "long");
    }
  }

  async saveQrCode(): Promise<void> {
    const loading = await this.presentLoading("Saving");
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const imageDataUrl = canvas.toDataURL("image/png", 1);
    const data = imageDataUrl.split(',')[1];
    const blob = this.base64toBlob(data, 'image/png');
    const filename = "qrcode_" + (new Date()).getTime() + '.png';
    await this.file.checkDir(this.env.baseDir, environment.appFolderName).then(
      async value => {
        if (!value) {
          await this.file.createDir(this.env.baseDir, environment.appFolderName, true).catch(err => console.error('createDir error', err));
        }
      },
      async err => {
        console.error("error in checkDir", err);
        await this.file.createDir(this.env.baseDir, environment.appFolderName, true).catch(err => console.error('createDir error', err));
      }
    );
    await this.file.writeFile(`${this.env.baseDir}/${environment.appFolderName}`, filename, blob as Blob, { replace: true, append: false }).then(
      async _ => {
        console.log('writeFile succeed');
        loading.dismiss();
        const finalPath = `${this.env.baseDir}${environment.appFolderName}/${filename}`.replace(/(^\w+:|^)\/\//, '');
        await this.presentToast(`Saved as ${finalPath}`, 5000, "middle", "left", "long");
      },
      async err => {
        console.error('writeFile error', err);
        loading.dismiss();
        await this.presentToast("Failed to save the QR code", 3000, "middle", "center", "long");
      }
    );
  }

  async shareQrCode(): Promise<void> {
    const loading = await this.presentLoading("Preparing");
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const imageDataUrl = canvas.toDataURL("image/png", 1);
    loading.dismiss();
    await this.socialSharing.share('Just scan it!\n\nShared by Simple QR', 'Simple QR', imageDataUrl, null);
  }

  generateVCardContact(): void {
    const lines = this.qrCodeContent.split("\n");
    if (!(lines[1]) || (lines[1] && lines[1] !== "VERSION:3.0")) {
      this.presentToast("Only vCard 3.0 is supported", 2000, "middle", "center", "long");
      return;
    }
    this.vCardContact = new VCardContact();
    const nameId1 = "N:";
    const nameId2 = "N;CHARSET=UTF-8:";
    const fullNameId1 = "FN:";
    const fullNameId2 = "FN;CHARSET=UTF-8:";
    const defaultEmailId1 = "EMAIL;TYPE=INTERNET:";
    const defaultEmailId2 = "EMAIL;CHARSET=UTF-8;TYPE=INTERNET:";
    const homeEmailId1 = "EMAIL;CHARSET=UTF-8;TYPE=HOME,INTERNET:";
    const homeEmailId2 = "EMAIL;TYPE=HOME,INTERNET:"
    const workEmailId1 = "EMAIL;CHARSET=UTF-8;TYPE=WORK,INTERNET:";
    const workEmailId2 = "EMAIL;TYPE=WORK,INTERNET:";
    const defaultPhoneNumberId = "TEL:";
    const mobilePhoneNumberId = "TEL;TYPE=CELL:";
    const homePhoneNumberId1 = "TEL;TYPE=HOME:";
    const homePhoneNumberId2 = "TEL;TYPE=HOME,VOICE:";
    const workPhoneNumberId1 = "TEL;TYPE=WORK:";
    const workPhoneNumberId2 = "TEL;TYPE=WORK,VOICE:";
    lines.forEach(
      line => {
        const tLine = line.trim();
        console.log(tLine);
        if (tLine.toUpperCase().substr(0,fullNameId1.length) === fullNameId1 ) {
          this.vCardContact.fullName = tLine.substr(fullNameId1.length);
        } else if (tLine.toUpperCase().substr(0,fullNameId2.length) === fullNameId2 ) {
          this.vCardContact.fullName = tLine.substr(fullNameId2.length);
        }
        if (tLine.toUpperCase().substr(0,nameId1.length) === nameId1) {
          const names =  tLine.substr(nameId1.length).split(";");
          this.vCardContact.familyName = names[0];
          this.vCardContact.givenName = names[1];
        } else if (tLine.toUpperCase().substr(0,nameId2.length) === nameId2 ) {
          const names =  tLine.substr(nameId2.length).split(";");
          this.vCardContact.familyName = names[0];
          this.vCardContact.givenName = names[1];
        }
        if (tLine.toUpperCase().substr(0,workEmailId1.length) === workEmailId1 ) {
          this.vCardContact.workEmail = tLine.substr(workEmailId1.length);
        } else if (tLine.toUpperCase().substr(0,workEmailId2.length) === workEmailId2 ) {
          this.vCardContact.workEmail = tLine.substr(workEmailId2.length);
        }
        if (tLine.toUpperCase().substr(0,homeEmailId1.length) === homeEmailId1 ) {
          this.vCardContact.homeEmail = tLine.substr(homeEmailId1.length);
        } else if (tLine.toUpperCase().substr(0,homeEmailId2.length) === homeEmailId2 ) {
          this.vCardContact.homeEmail = tLine.substr(homeEmailId2.length);
        }
        if (tLine.toUpperCase().substr(0,defaultEmailId1.length) === defaultEmailId1 ) {
          this.vCardContact.defaultEmail = tLine.substr(defaultEmailId1.length);
        } else if (tLine.toUpperCase().substr(0,defaultEmailId2.length) === defaultEmailId2 ) {
          this.vCardContact.defaultEmail = tLine.substr(defaultEmailId2.length);
        }
        if (tLine.toUpperCase().substr(0,workPhoneNumberId1.length) === workPhoneNumberId1 ) {
          this.vCardContact.workPhoneNumber = tLine.substr(workPhoneNumberId1.length);
        } else if (tLine.toUpperCase().substr(0,workPhoneNumberId2.length) === workPhoneNumberId2 ) {
          this.vCardContact.workPhoneNumber = tLine.substr(workPhoneNumberId2.length);
        }
        if (tLine.toUpperCase().substr(0,homePhoneNumberId1.length) === homePhoneNumberId1 ) {
          this.vCardContact.homePhoneNumber = tLine.substr(homePhoneNumberId1.length);
        } else if (tLine.toUpperCase().substr(0,homePhoneNumberId2.length) === homePhoneNumberId2 ) {
          this.vCardContact.homePhoneNumber = tLine.substr(homePhoneNumberId2.length);
        }
        if (tLine.toUpperCase().substr(0,mobilePhoneNumberId.length) === mobilePhoneNumberId ) {
          this.vCardContact.mobilePhoneNumber = tLine.substr(mobilePhoneNumberId.length);
        }
        if (tLine.toUpperCase().substr(0,defaultPhoneNumberId.length) === defaultPhoneNumberId ) {
          this.vCardContact.defaultPhoneNumber = tLine.substr(defaultPhoneNumberId.length);
        }
      }
    )
  }

  returnScanPage(): void {
    this.router.navigate(['/scan'], { replaceUrl: true });
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

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg,
      mode: "ios"
    });
    await loading.present();
    return loading;
  }

}
