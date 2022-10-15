import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { EnvService } from 'src/app/services/env.service';
import { Toast } from '@capacitor/toast';
import { fadeIn } from 'src/app/utils/animations';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.page.html',
  styleUrls: ['./generate.page.scss'],
  animations: [fadeIn]
})
export class GeneratePage {

  @ViewChild('content') contentEl: HTMLIonContentElement;

  freeTxtText: string = "Free Text";
  urlText: string = "URL";
  contactText: string = "vCard Contact";
  phoneText: string = "Phone";
  smsText: string = "Message";
  emailW3CText: string = "Email (W3C Standard)";
  emailDocomoText: string = "Email (NTT Docomo)";
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
  birthday: string;
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

  contentTypes: { text: string, value: "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi" }[] = [
    { text: this.freeTxtText, value: 'freeText' },
    { text: this.emailW3CText, value: 'emailW3C' },
    { text: this.emailDocomoText, value: 'emailDocomo' },
    { text: this.phoneText, value: 'phone' },
    { text: this.smsText, value: 'sms' },
    { text: this.urlText, value: 'url' },
    { text: this.contactText, value: 'contact' },
    { text: this.wifiText, value: 'wifi' },
  ];
  contentType: "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi" = "freeText";

  constructor(
    public translate: TranslateService,
    public env: EnvService,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
  ) { }

  async ionViewDidEnter() {
    await SplashScreen.hide()
    this.freeTxtText = this.translate.instant("FREE_TEXT");
    this.urlText = this.translate.instant("URL");
    this.contactText = this.translate.instant("VCARD_CONTACT");
    this.phoneText = this.translate.instant("PHONE_NO");
    this.smsText = this.translate.instant("MESSAGE");
    this.emailW3CText = this.translate.instant("EMAIL_W3C_STANDARD");
    this.emailDocomoText = this.translate.instant("EMAIL_NTT_DOCOMO");
    this.wifiText = this.translate.instant("WIFI");
    this.contentTypes = [
      { text: this.freeTxtText, value: 'freeText' },
      { text: this.emailW3CText, value: 'emailW3C' },
      { text: this.emailDocomoText, value: 'emailDocomo' },
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

  ionViewDidLeave() {
    this.clear();
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

  clear() {
    this.qrCodeContent = "";
    this.toEmails = [""];
    this.ccEmails = [];
    this.bccEmails = [];
    this.emailSubject = "";
    this.emailBody = "";

    this.phoneNumber = "";

    this.smsMessage = "";

    this.url = "";

    this.firstName = "";
    this.lastName = "";
    this.mobilePhoneNumber = "";
    this.homePhoneNumber = "";
    this.workPhoneNumber = "";
    this.faxNumber = "";
    this.email = "";
    this.organization = "";
    this.jobTitle = "";
    this.street = "";
    this.city = "";
    this.state = "";
    this.postalCode = "";
    this.country = "";
    delete this.birthday;
    this.gender = "O";
    this.personalUrl = "";

    this.ssid = "";
    this.wifiPassword = "";
    this.wifiEncryption = "WPA";
    this.wifiHidden = false;
  }

  async goGenerate() {
    switch (this.contentType) {
      case "emailW3C":
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
      case "emailDocomo":
        this.qrCodeContent = `MATMSG:TO:${this.toEmails[0]};SUB:${this.emailSubject};BODY:${this.emailBody};;`;
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
      await this.presentToast(this.translate.instant('MSG.QR_CODE_VALUE_NOT_EMPTY'), "short", "bottom");
    } else if (this.qrCodeContent.length > 1817) {
      await this.presentToast(this.translate.instant('MSG.CREATE_QRCODE_MAX_LENGTH'), "short", "bottom");
    } else {
      const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
      await this.processQrCode(loading);
    }
  }

  async processQrCode(loading: HTMLIonLoadingElement): Promise<void> {
    this.env.result = this.qrCodeContent;
    this.env.resultFormat = "";
    this.qrCodeContent = '';
    this.env.recordSource = "create";
    this.env.detailedRecordSource = "create";
    this.env.viewResultFrom = "/tabs/generate";
    this.router.navigate(['tabs/result']).then(
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
    if (this.birthday != null) {
      const find = '-';
      const re = new RegExp(find, 'g');
      vCard += `BDAY:${this.birthday.replace(re, "")}\n`;
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
    return format(new Date(), "yyyy-MM-dd");
  }

  getIcon(type: "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi"): string {
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
      case "emailW3C":
        return "email";
      case "emailDocomo":
        return "email";
      case "wifi":
        return "wifi";
      default:
        return "format_align_left";
    }
  }

  getText(type: "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi"): string {
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
      case "emailW3C":
        return this.emailW3CText;
      case "emailDocomo":
        return this.emailDocomoText;
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

  get ngMatThemeClass() {
    switch (this.env.colorTheme) {
      case 'dark':
        return 'ng-mat-dark';
      case 'light':
        return 'ng-mat-light';
      case 'black':
        return 'ng-mat-black';
      default:
        return 'ng-mat-light';
    }
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Medium })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }
}
