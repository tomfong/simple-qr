import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.page.html',
  styleUrls: ['./generate.page.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate(
              '1s ease',
              style({ opacity: 1 })
            )
          ]
        )
      ]
    )
  ]
})
export class GeneratePage {

  @ViewChild('content') contentEl: HTMLIonContentElement;

  freeTxtText: string = "Free Text";
  urlText: string = "URL";
  contactText: string = "vCard Contact";
  phoneText: string = "Phone";
  smsText: string = "Message";
  emailText: string = "Email";
  wifiText: string = "WiFi";

  qrCodeContent: string = "";

  toEmails: string[] = [""];
  ccEmails: string[] = [];
  bccEmails: string[] = [];
  emailSubject: string = "";
  emailBody: string = "";

  phoneNumber: string = "";

  smsMessage: string = "";

  url: string = "";

  firstName: string = "";
  lastName: string = "";
  mobilePhoneNumber: string = "";
  homePhoneNumber: string = "";
  workPhoneNumber: string = "";
  faxNumber: string = "";
  email: string = "";
  organization: string = "";
  jobTitle: string = "";
  street: string = "";
  city: string = "";
  state: string = "";
  postalCode: string = "";
  country: string = "";
  birthday: Date;
  gender: "M" | "F" | "O" = "O";
  personalUrl: string = "";

  ssid: string = "";
  wifiPassword: string = "";
  wifiEncryption: 'nopass' | 'WEP' | 'WPA' = "WPA";
  wifiHidden: boolean = false;

  maleText: string = "Male";
  femaleText: string = "Female";
  noneGenderText: string = "Not to disclose";
  genders: { text: string, value: "M" | "F" | "O" }[] = [
    { text: this.noneGenderText, value: "O" },
    { text: this.maleText, value: "M" },
    { text: this.femaleText, value: "F" },
  ]

  noneWifiEncText: string = "None";
  wepText: string = "WEP";
  wpaText: string = "WPA/WPA2";
  wifiEncryptions: { text: string, value: 'nopass' | 'WEP' | 'WPA' }[] = [
    { text: this.noneWifiEncText, value: "nopass" },
    { text: this.wepText, value: "WEP" },
    { text: this.wpaText, value: "WPA" },
  ]

  contentTypes: { text: string, value: "freeText" | "url" | "contact" | "phone" | "sms" | "email" | "wifi" }[] = [
    { text: this.freeTxtText, value: 'freeText' },
    { text: this.emailText, value: 'email' },
    { text: this.phoneText, value: 'phone' },
    { text: this.smsText, value: 'sms' },
    { text: this.urlText, value: 'url' },
    { text: this.contactText, value: 'contact' },
    { text: this.wifiText, value: 'wifi' },
  ];
  contentType: "freeText" | "url" | "contact" | "phone" | "sms" | "email" | "wifi" = "freeText";

  constructor(
    public toastController: ToastController,
    public translate: TranslateService,
    public env: EnvService,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
  ) {
    this.freeTxtText = this.translate.instant("FREE_TEXT");
    this.urlText = this.translate.instant("URL");
    this.contactText = this.translate.instant("VCARD_CONTACT");
    this.phoneText = this.translate.instant("PHONE");
    this.smsText = this.translate.instant("SMS");
    this.emailText = this.translate.instant("EMAIL");
    this.wifiText = this.translate.instant("WIFI");
    this.contentTypes = [
      { text: this.freeTxtText, value: 'freeText' },
      { text: this.emailText, value: 'email' },
      { text: this.phoneText, value: 'phone' },
      { text: this.smsText, value: 'sms' },
      { text: this.urlText, value: 'url' },
      { text: this.contactText, value: 'contact' },
      { text: this.wifiText, value: 'wifi' },
    ];
    this.noneGenderText = this.translate.instant("NOT_TO_DISCLOSE");
    this.maleText = this.translate.instant("MALE");
    this.femaleText = this.translate.instant("FEMALE");
    this.genders = [
      { text: this.noneGenderText, value: "O" },
      { text: this.maleText, value: "M" },
      { text: this.femaleText, value: "F" },
    ]
    this.noneWifiEncText = this.translate.instant("NONE");
    this.wifiEncryptions = [
      { text: this.noneWifiEncText, value: "nopass" },
      { text: this.wepText, value: "WEP" },
      { text: this.wpaText, value: "WPA" },
    ];
  }

  ionViewDidEnter() {
    this.freeTxtText = this.translate.instant("FREE_TEXT");
    this.urlText = this.translate.instant("URL");
    this.contactText = this.translate.instant("VCARD_CONTACT");
    this.phoneText = this.translate.instant("PHONE");
    this.smsText = this.translate.instant("SMS");
    this.emailText = this.translate.instant("EMAIL");
    this.wifiText = this.translate.instant("WIFI");
    this.contentTypes = [
      { text: this.freeTxtText, value: 'freeText' },
      { text: this.emailText, value: 'email' },
      { text: this.phoneText, value: 'phone' },
      { text: this.smsText, value: 'sms' },
      { text: this.urlText, value: 'url' },
      { text: this.contactText, value: 'contact' },
      { text: this.wifiText, value: 'wifi' },
    ];
    this.noneGenderText = this.translate.instant("NOT_TO_DISCLOSE");
    this.maleText = this.translate.instant("MALE");
    this.femaleText = this.translate.instant("FEMALE");
    this.genders = [
      { text: this.noneGenderText, value: "O" },
      { text: this.maleText, value: "M" },
      { text: this.femaleText, value: "F" },
    ]
    this.noneWifiEncText = this.translate.instant("NONE");
    this.wifiEncryptions = [
      { text: this.noneWifiEncText, value: "nopass" },
      { text: this.wepText, value: "WEP" },
      { text: this.wpaText, value: "WPA" },
    ];
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  addEmailField() {
    this.toEmails.push("");
  }

  removeEmailField() {
    if (this.toEmails?.length > 1) {
      this.toEmails.pop();
    }
  }

  addCcField() {
    this.ccEmails.push("");
  }

  removeCcField() {
    if (this.ccEmails?.length > 0) {
      this.ccEmails.pop();
    }
  }

  addBccField() {
    this.bccEmails.push("");
    setTimeout(
      () => {
        this.contentEl.scrollToBottom(500);
      }, 500
    );
  }

  removeBccField() {
    if (this.bccEmails?.length > 0) {
      this.bccEmails.pop();
    }
  }

  async goGenerate() {
    switch (this.contentType) {
      case "email":
        this.qrCodeContent = "mailto:";
        this.toEmails.forEach((email, i, emails) => {
          emails[i] = email.trim();
        });
        this.qrCodeContent += this.toEmails.join(",");
        this.qrCodeContent += "?";
        if (this.ccEmails.length > 0) {
          this.qrCodeContent += "cc=";
          this.ccEmails.forEach((email, i, emails) => {
            emails[i] = email.trim();
          });
          this.qrCodeContent += this.ccEmails.join(",");
          this.qrCodeContent += "&";
        }
        if (this.bccEmails.length > 0) {
          this.qrCodeContent += "bcc=";
          this.bccEmails.forEach((email, i, emails) => {
            emails[i] = email.trim();
          });
          this.qrCodeContent += this.bccEmails.join(",");
          this.qrCodeContent += "&";
        }
        if (this.emailSubject.length > 0) {
          this.qrCodeContent += "subject=";
          this.qrCodeContent += this.emailSubject;
          this.qrCodeContent += "&";
        }
        this.qrCodeContent += "body=";
        this.qrCodeContent += this.emailBody;
        this.qrCodeContent = encodeURI(this.qrCodeContent);
        break;
      case "phone":
        this.qrCodeContent = "tel:";
        this.qrCodeContent += this.phoneNumber;
        break;
      case "sms":
        this.qrCodeContent = "smsto:";
        this.qrCodeContent += this.phoneNumber;
        this.qrCodeContent += ":";
        this.qrCodeContent += this.smsMessage;
        break;
      case "url":
        if (this.url.includes("://")) {
          this.qrCodeContent = encodeURI(this.url);
        } else {
          this.qrCodeContent = "https://";
          this.qrCodeContent += this.url;
          this.qrCodeContent = encodeURI(this.qrCodeContent);
        }
        break;
      case "contact":
        this.qrCodeContent = this.getVCard();
        break;
      case "wifi":
        this.qrCodeContent = `WIFI:T:${this.wifiEncryption};S:${this.ssid};P:${this.wifiPassword};H:${this.wifiHidden ? 'true' : ''};`;
    }
    if ((this.qrCodeContent && this.qrCodeContent.trim().length <= 0) || this.qrCodeContent === "") {
      this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), 1500, "bottom", "center", "long");
    } else if (this.qrCodeContent.length > 1817) {
      this.presentToast(this.translate.instant('CREATE_QRCODE_MAX_LENGTH'), 1500, "bottom", "center", "long");
    } else {
      const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
      await this.processQrCode(loading);
    }
  }

  async processQrCode(loading: HTMLIonLoadingElement): Promise<void> {
    this.env.result = this.qrCodeContent;
    this.qrCodeContent = '';
    this.router.navigate(['tabs/result', { t: new Date().getTime() }]).then(
      () => {
        loading.dismiss();
      }
    );
  }

  getVCard(): string {
    let vCard = "BEGIN:VCARD\nVERSION:3.0\n";
    vCard += `N:${this.lastName.trim()};${this.firstName.trim()}\n`;
    vCard += `FN:${this.firstName.trim()} ${this.lastName.trim()}\n`;
    vCard += `TEL;CELL:${this.mobilePhoneNumber.trim()}\n`;
    vCard += `TEL;HOME;VOICE:${this.homePhoneNumber.trim()}\n`;
    vCard += `TEL;WORK;VOICE:${this.workPhoneNumber.trim()}\n`;
    vCard += `TEL;FAX:${this.faxNumber.trim()}\n`;
    vCard += `EMAIL;INTERNET:${this.email.trim()}\n`;
    vCard += `ORG:${this.organization.trim()}\n`;
    vCard += `TITLE:${this.jobTitle.trim()}\n`;
    vCard += `ADR:;;${this.street.trim()};${this.city.trim()};${this.state.trim()};${this.postalCode.trim()};${this.country.trim()}\n`;
    console.log("birthday => " + this.birthday)
    if (this.birthday && this.birthday !== null && this.birthday !== undefined) {
      vCard += `BDAY:${moment(this.birthday).format('YYYYMMDD')}\n`;
    }
    vCard += `URL:${this.personalUrl.trim()}\n`;
    vCard += `GENDER:${this.gender}\n`;
    vCard += `END:VCARD`;
    return vCard;
  }

  get disableGenerateBtn(): boolean {
    switch (this.contentType) {
      case "freeText":
        return (!this.qrCodeContent || (this.qrCodeContent && this.qrCodeContent.trim().length <= 0));
      default:
        return false;
    }
  }

  get today() {
    return moment().format("YYYY-MM-DD");
  }

  getIcon(type: "freeText" | "url" | "contact" | "phone" | "sms" | "email" | "wifi"): string {
    switch (type) {
      case "freeText":
        return "format_align_left";
      case "url":
        return "link";
      case "contact":
        return "contact_phone";
      case "phone":
        return "call";
      case "sms":
        return "sms";
      case "email":
        return "email";
      case "wifi":
        return "wifi";
      default:
        return "format_align_left";
    }
  }

  getText(type: "freeText" | "url" | "contact" | "phone" | "sms" | "email" | "wifi"): string {
    switch (type) {
      case "freeText":
        return this.freeTxtText;
      case "url":
        return this.urlText;
      case "contact":
        return this.contactText;
      case "phone":
        return this.phoneText;
      case "sms":
        return this.smsText;
      case "email":
        return this.emailText;
      case "wifi":
        return this.wifiText;
      default:
        return this.freeTxtText;
    }
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
}
