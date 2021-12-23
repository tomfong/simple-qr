import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Device } from '@ionic-native/device/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { ActionSheetController, AlertController, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { CreateContactPage } from 'src/app/modals/create-contact/create-contact.page';
import { VCardContact } from 'src/app/models/v-card-contact';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  contentType: "freeText" | "url" | "contact" | "phone" | "sms" | "email" | "wifi" = "freeText";

  qrCodeContent: string;
  qrElementType: NgxQrcodeElementTypes = NgxQrcodeElementTypes.CANVAS;
  errorCorrectionLevel: NgxQrcodeErrorCorrectionLevels = NgxQrcodeErrorCorrectionLevels.LOW;
  qrMargin: number = 3;

  phoneNumber: string;
  vCardContact: VCardContact;
  smsContent: string;

  toEmails: string;
  ccEmails: string;
  bccEmails: string;
  emailSubject: string;
  emailBody: string;

  wifiSSID: string;
  wifiPassword: string;
  wifiEncryption: 'NONE' | 'WEP' | 'WPA';
  wifiHidden: boolean = false;

  base64Encoded: boolean = false;
  base64EncodedText: string = "";
  base64Decoded: boolean = false;
  base64DecodedText: string = "";

  // webToast: HTMLIonToastElement;

  bookmarked: boolean = false;

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private route: ActivatedRoute,
    private vibration: Vibration,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    private clipboard: Clipboard,
    private socialSharing: SocialSharing,
    private callNumber: CallNumber,
    public modalController: ModalController,
    private sms: SMS,
    public translate: TranslateService,
    private actionSheetController: ActionSheetController,
  ) { }

  async ngOnInit() {
    this.qrCodeContent = this.env.result;
    this.setContentType();
    if (this.env.scanRecordLogging === 'on') {
      await this.env.saveScanRecord(this.qrCodeContent);
    }
    if (this.env.bookmarks.find(x => x.text === this.qrCodeContent)) {
      this.bookmarked = true;
    }
  }

  async ionViewDidEnter(): Promise<void> {
    if (this.env.vibration === 'on') {
      if (this.platform.is("android")) {
        this.vibration.vibrate([100, 100, 100]);
      } else {
        this.vibration.vibrate(100);
      }
    }
    // if (this.contentType === "url") {
    //   this.webToast = await this.toastController.create({
    //     header: this.translate.instant('WEBSITE'),
    //     message: `${this.qrCodeContent}`,
    //     duration: 3000,
    //     mode: "ios",
    //     color: "light",
    //     position: "top",
    //     buttons: [
    //       {
    //         text: this.translate.instant('OPEN'),
    //         side: 'end',
    //         handler: () => {
    //           this.browseWebsite();
    //           this.webToast.dismiss();
    //         }
    //       }
    //     ]
    //   });
    //   this.webToast.present();
    // }
    // if (this.contentType === "wifi") {
    //   if (this.wifiSSID) {
    //     this.webToast = await this.toastController.create({
    //       header: this.translate.instant('WIFI_NETWORK'),
    //       message: `SSID: ${this.wifiSSID}`,
    //       duration: 3000,
    //       mode: "ios",
    //       color: "light",
    //       position: "top",
    //       buttons: [
    //         {
    //           text: this.translate.instant('CONNECT'),
    //           side: 'end',
    //           handler: async () => {
    //             await this.connectWifi();
    //           }
    //         }
    //       ]
    //     });
    //     this.webToast.present();
    //   }
    // }
  }

  async ionViewWillLeave(): Promise<void> {
    this.vibration.vibrate(0);
    this.base64Decoded = false;
    this.base64Encoded = false;
    // if (this.webToast) {
    //   this.webToast.dismiss();
    //   this.webToast = undefined;
    // }
  }

  setContentType(): void {
    const urlPrefix1 = "HTTPS://";
    const urlPrefix2 = "HTTP://";
    const contactPrefix = "BEGIN:VCARD";
    const phonePrefix = "TEL:";
    const smsPrefix = "SMSTO:";
    const emailPrefix = "MAILTO:";
    const wifiPrefix = "WIFI:";
    const tContent = this.qrCodeContent.trim().toUpperCase();
    if (tContent.substr(0, urlPrefix1.length) === urlPrefix1 || tContent.substr(0, urlPrefix2.length) === urlPrefix2) {
      this.contentType = "url";
    } else if (tContent.substr(0, contactPrefix.length) === contactPrefix) {
      this.contentType = "contact";
      this.generateVCardContact();
    } else if (tContent.substr(0, phonePrefix.length) === phonePrefix) {
      this.contentType = "phone";
      this.phoneNumber = tContent.substr(phonePrefix.length);
    } else if (tContent.substr(0, smsPrefix.length) === smsPrefix) {
      this.contentType = "sms";
      const tContent2 = tContent.substr(smsPrefix.length);
      if (tContent2.indexOf(':') !== -1) {
        this.phoneNumber = tContent2.substr(0, tContent2.indexOf(':'));
        this.smsContent = tContent2.substr(tContent2.indexOf(':') + 1);
      } else {
        this.phoneNumber = tContent2.substr(0);
      }
    } else if (tContent.substr(0, emailPrefix.length) === emailPrefix) {
      this.contentType = "email";
      this.prepareEmail();
    } else if (tContent.substr(0, wifiPrefix.length) === wifiPrefix) {
      this.contentType = "wifi";
      this.prepareWifi();
    } else {
      this.contentType = "freeText";
    }
  }

  get qrColorDark(): string {
    // return this.env.colorTheme === "dark" ? "#ffffff" : "#222428";
    return "#222428";
  }

  get qrColorLight(): string {
    // return this.env.colorTheme === "dark" ? "#121212" : "#ffffff";
    return "#ffffff";
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
    } else if (this.contentType === "phone" || this.contentType === "sms") {
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
              this.presentToast(this.translate.instant('MSG.SAVED'), 2000, "bottom", "center", "short");
            }, err => {
              this.presentToast(this.translate.instant('MSG.FAIL_SAVE_CONTACT'), 3000, "middle", "center", "long");
            })
          }
        }
      }
    );
    await modal.present();
  }

  async callPhone(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('PHONE_CALL'),
      message: this.translate.instant('MSG.CALL_PHONE').replace('{phoneNumber}', this.phoneNumber),
      buttons: [
        {
          text: this.translate.instant('YES'),
          handler: async () => {
            alert.dismiss();
            await this.callNumber.callNumber(this.phoneNumber, false).catch(
              async (err) => {
                this.presentToast(this.translate.instant('MSG.FAIL_CALL_PHONE'), 3000, "middle", "center", "long");
              }
            );
          }
        },
        {
          text: this.translate.instant('NO'),
          role: 'cancel',
          cssClass: 'btn-inverse'
        }
      ]
    });
    await alert.present();
  }

  async sendSms(): Promise<void> {
    if (this.smsContent) {
      if (this.platform.is('android')) {
        await this.sms.send(
          this.phoneNumber,
          this.smsContent,
          {
            replaceLineBreaks: true,
            android: {
              intent: 'INTENT'
            }
          }
        ).then(
          (value) => {
            this.presentToast(this.translate.instant('MSG.PREPARE_SMS'), 2000, "middle", "center", "long");
          },
          async (err) => {
            console.error("error in send sms", err)
            this.presentToast(this.translate.instant('MSG.FAIL_PREPARE_SMS'), 3000, "middle", "center", "long");
          }
        )
      } else {
        await this.sms.send(
          this.phoneNumber,
          this.smsContent,
          {
            replaceLineBreaks: true
          }
        ).then(
          (value) => {
            this.presentToast(this.translate.instant('MSG.PREPARE_SMS'), 2000, "middle", "center", "long");
          },
          async (err) => {
            console.error("error in send sms", err)
            this.presentToast(this.translate.instant('MSG.FAIL_PREPARE_SMS'), 3000, "middle", "center", "long");
          }
        )
      }
    }
  }

  async sendEmail(): Promise<void> {
    window.open(this.qrCodeContent, "_system");
  }

  async webSearch(): Promise<void> {
    let searchUrl: string = this.env.GOOGLE_SEARCH_URL;
    switch (this.env.searchEngine) {
      case 'google':
        searchUrl = this.env.GOOGLE_SEARCH_URL;
        break;
      case 'bing':
        searchUrl = this.env.BING_SEARCH_URL;
        break;
      case 'yahoo':
        searchUrl = this.env.YAHOO_SEARCH_URL;
        break;
      case 'duckduckgo':
        searchUrl = this.env.DUCK_DUCK_GO_SEARCH_URL;
        break;
      default:
        searchUrl = this.env.GOOGLE_SEARCH_URL;
        break;
    }
    let url: string;
    if (this.base64Decoded) {
      const alert = await this.alertController.create(
        {
          header: this.translate.instant('SEARCH'),
          message: this.translate.instant('MSG.SEARCH'),
          buttons: [
            {
              text: this.translate.instant('ORIGINAL'),
              handler: () => {
                alert.dismiss();
                url = searchUrl + encodeURIComponent(this.qrCodeContent);
                window.open(url, '_system');
              }
            },
            {
              text: this.translate.instant('BASE64_DECODED'),
              handler: () => {
                alert.dismiss();
                url = searchUrl + encodeURIComponent(this.base64DecodedText);
                window.open(url, '_system');
              }
            }
          ]
        }
      )
      alert.present();
    } else {
      url = searchUrl + encodeURIComponent(this.qrCodeContent);
      window.open(url, '_system');
    }
  }

  async copyText(): Promise<void> {
    if (this.base64Decoded && this.base64Encoded) {
      const alert = await this.alertController.create(
        {
          header: this.translate.instant('COPY'),
          message: this.translate.instant('MSG.COPY_TEXT'),
          buttons: [
            {
              text: this.translate.instant('ORIGINAL'),
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.qrCodeContent).then(
                  async () => {
                    await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
                  }
                )
              }
            },
            {
              text: this.translate.instant('BASE64_ENCODED'),
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.base64EncodedText).then(
                  async () => {
                    await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
                  }
                )
              }
            },
            {
              text: this.translate.instant('BASE64_DECODED'),
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.base64DecodedText).then(
                  async () => {
                    await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
                  }
                )
              }
            }
          ]
        }
      )
      alert.present();
    } else if (!this.base64Decoded && this.base64Encoded) {
      const alert = await this.alertController.create(
        {
          header: this.translate.instant('COPY'),
          message: this.translate.instant('MSG.COPY_TEXT'),
          buttons: [
            {
              text: this.translate.instant('ORIGINAL'),
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.qrCodeContent).then(
                  async () => {
                    await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
                  }
                )
              }
            },
            {
              text: this.translate.instant('BASE64_ENCODED'),
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.base64EncodedText).then(
                  async () => {
                    await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
                  }
                )
              }
            }
          ]
        }
      )
      alert.present();
    } else if (this.base64Decoded && !this.base64Encoded) {
      const alert = await this.alertController.create(
        {
          header: this.translate.instant('COPY'),
          message: this.translate.instant('MSG.COPY_TEXT'),
          buttons: [
            {
              text: this.translate.instant('ORIGINAL'),
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.qrCodeContent).then(
                  async () => {
                    await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
                  }
                )
              }
            },
            {
              text: this.translate.instant('BASE64_DECODED'),
              handler: async () => {
                alert.dismiss();
                await this.clipboard.copy(this.base64DecodedText).then(
                  async () => {
                    await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
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
          await this.presentToast(this.translate.instant('MSG.COPIED'), 1500, "bottom", "center", "short");
        }
      )
    }
  }

  async base64(): Promise<void> {
    let failEncoded = false, failDecoded = false;
    try {
      this.base64EncodedText = btoa(this.qrCodeContent ? this.qrCodeContent : "");
      this.base64Encoded = true;
    } catch (err) {
      this.base64Encoded = false;
      failEncoded = true;
    }
    try {
      this.base64DecodedText = atob(this.qrCodeContent ? this.qrCodeContent : "");
      this.base64Decoded = true;
    } catch (err) {
      this.base64Decoded = false;
      failDecoded = true;
    }
    if (failEncoded && failDecoded) {
      await this.presentToast(this.translate.instant('MSG.NOT_BASE64_EN_DE'), 2000, "middle", "center", "long");
    } else if (failEncoded && !failDecoded) {
      await this.presentToast(this.translate.instant('MSG.NOT_BASE64_EN'), 2000, "middle", "center", "long");
    } else if (!failEncoded && failDecoded) {
      await this.presentToast(this.translate.instant('MSG.NOT_BASE64_DE'), 2000, "middle", "center", "long");
    }
  }

  async shareQrCode(): Promise<void> {
    const loading = await this.presentLoading(this.translate.instant('PREPARING'));
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const imageDataUrl = canvas.toDataURL("image/png", 1);
    loading.dismiss();
    await this.socialSharing.share(this.translate.instant('MSG.SHARE_QR'), this.translate.instant('SIMPLE_QR'), imageDataUrl, null);
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
    const defaultEmailId3 = "EMAIL;INTERNET:";
    const homeEmailId1 = "EMAIL;CHARSET=UTF-8;TYPE=HOME,INTERNET:";
    const homeEmailId2 = "EMAIL;TYPE=HOME,INTERNET:"
    const homeEmailId3 = "EMAIL;HOME;INTERNET:"
    const workEmailId1 = "EMAIL;CHARSET=UTF-8;TYPE=WORK,INTERNET:";
    const workEmailId2 = "EMAIL;TYPE=WORK,INTERNET:";
    const workEmailId3 = "EMAIL;WORK;INTERNET:"
    const defaultPhoneNumberId = "TEL:";
    const mobilePhoneNumberId1 = "TEL;TYPE=CELL:";
    const mobilePhoneNumberId2 = "TEL;CELL:";
    const homePhoneNumberId1 = "TEL;TYPE=HOME:";
    const homePhoneNumberId2 = "TEL;TYPE=HOME,VOICE:";
    const homePhoneNumberId3 = "TEL;HOME;VOICE:";
    const workPhoneNumberId1 = "TEL;TYPE=WORK:";
    const workPhoneNumberId2 = "TEL;TYPE=WORK,VOICE:";
    const workPhoneNumberId3 = "TEL;WORK;VOICE:";
    lines.forEach(
      line => {
        const tLine = line.trim();
        console.log(tLine);
        if (tLine.toUpperCase().substr(0, fullNameId1.length) === fullNameId1) {
          this.vCardContact.fullName = tLine.substr(fullNameId1.length);
        } else if (tLine.toUpperCase().substr(0, fullNameId2.length) === fullNameId2) {
          this.vCardContact.fullName = tLine.substr(fullNameId2.length);
        }
        if (tLine.toUpperCase().substr(0, nameId1.length) === nameId1) {
          const names = tLine.substr(nameId1.length).split(";");
          this.vCardContact.familyName = names[0];
          this.vCardContact.givenName = names[1];
        } else if (tLine.toUpperCase().substr(0, nameId2.length) === nameId2) {
          const names = tLine.substr(nameId2.length).split(";");
          this.vCardContact.familyName = names[0];
          this.vCardContact.givenName = names[1];
        }
        if (tLine.toUpperCase().substr(0, workEmailId1.length) === workEmailId1) {
          this.vCardContact.workEmail = tLine.substr(workEmailId1.length);
        } else if (tLine.toUpperCase().substr(0, workEmailId2.length) === workEmailId2) {
          this.vCardContact.workEmail = tLine.substr(workEmailId2.length);
        } else if (tLine.toUpperCase().substr(0, workEmailId3.length) === workEmailId3) {
          this.vCardContact.workEmail = tLine.substr(workEmailId3.length);
        }
        if (tLine.toUpperCase().substr(0, homeEmailId1.length) === homeEmailId1) {
          this.vCardContact.homeEmail = tLine.substr(homeEmailId1.length);
        } else if (tLine.toUpperCase().substr(0, homeEmailId2.length) === homeEmailId2) {
          this.vCardContact.homeEmail = tLine.substr(homeEmailId2.length);
        } else if (tLine.toUpperCase().substr(0, homeEmailId3.length) === homeEmailId3) {
          this.vCardContact.homeEmail = tLine.substr(homeEmailId3.length);
        }
        if (tLine.toUpperCase().substr(0, defaultEmailId1.length) === defaultEmailId1) {
          this.vCardContact.defaultEmail = tLine.substr(defaultEmailId1.length);
        } else if (tLine.toUpperCase().substr(0, defaultEmailId2.length) === defaultEmailId2) {
          this.vCardContact.defaultEmail = tLine.substr(defaultEmailId2.length);
        } else if (tLine.toUpperCase().substr(0, defaultEmailId3.length) === defaultEmailId3) {
          this.vCardContact.defaultEmail = tLine.substr(defaultEmailId3.length);
        }
        if (tLine.toUpperCase().substr(0, workPhoneNumberId1.length) === workPhoneNumberId1) {
          this.vCardContact.workPhoneNumber = tLine.substr(workPhoneNumberId1.length);
        } else if (tLine.toUpperCase().substr(0, workPhoneNumberId2.length) === workPhoneNumberId2) {
          this.vCardContact.workPhoneNumber = tLine.substr(workPhoneNumberId2.length);
        } else if (tLine.toUpperCase().substr(0, workPhoneNumberId3.length) === workPhoneNumberId3) {
          this.vCardContact.homePhoneNumber = tLine.substr(workPhoneNumberId3.length);
        }
        if (tLine.toUpperCase().substr(0, homePhoneNumberId1.length) === homePhoneNumberId1) {
          this.vCardContact.homePhoneNumber = tLine.substr(homePhoneNumberId1.length);
        } else if (tLine.toUpperCase().substr(0, homePhoneNumberId2.length) === homePhoneNumberId2) {
          this.vCardContact.homePhoneNumber = tLine.substr(homePhoneNumberId2.length);
        } else if (tLine.toUpperCase().substr(0, homePhoneNumberId3.length) === homePhoneNumberId3) {
          this.vCardContact.homePhoneNumber = tLine.substr(homePhoneNumberId3.length);
        }
        if (tLine.toUpperCase().substr(0, mobilePhoneNumberId1.length) === mobilePhoneNumberId1) {
          this.vCardContact.mobilePhoneNumber = tLine.substr(mobilePhoneNumberId1.length);
        } else if (tLine.toUpperCase().substr(0, mobilePhoneNumberId2.length) === mobilePhoneNumberId2) {
          this.vCardContact.mobilePhoneNumber = tLine.substr(mobilePhoneNumberId2.length);
        }
        if (tLine.toUpperCase().substr(0, defaultPhoneNumberId.length) === defaultPhoneNumberId) {
          this.vCardContact.defaultPhoneNumber = tLine.substr(defaultPhoneNumberId.length);
        }
      }
    )
  }

  prepareEmail(): void {
    const emailPrefix = "MAILTO:";
    const emailString = this.qrCodeContent.substr(emailPrefix.length);
    const emailParts = emailString.split('?', 2);
    this.toEmails = emailParts[0].trim();
    if (emailParts.length > 1) {
      const secondEmailParts = emailParts[1].split("&");
      const ccPrefix = "cc=";
      const bccPrefix = "bcc=";
      const subjectPrefix = "subject=";
      const bodyPrefix = "body=";
      secondEmailParts.forEach(
        (part) => {
          if (part.toLowerCase().substr(0, ccPrefix.length) === ccPrefix) {
            this.ccEmails = part.substr(ccPrefix.length);
          }
          if (part.toLowerCase().substr(0, bccPrefix.length) === bccPrefix) {
            this.bccEmails = part.substr(bccPrefix.length);
          }
          if (part.toLowerCase().substr(0, subjectPrefix.length) === subjectPrefix) {
            this.emailSubject = decodeURIComponent(part.substr(subjectPrefix.length));
          }
          if (part.toLowerCase().substr(0, bodyPrefix.length) === bodyPrefix) {
            this.emailBody = decodeURIComponent(part.substr(bodyPrefix.length));
          }
        }
      );
    }
  }

  prepareWifi(): void {
    const wifiPrefix = "WIFI:";
    const wifiString = this.qrCodeContent.substr(wifiPrefix.length);
    const wifiParts = wifiString.replace(/\\;/g, 'ä').replace(/\\:/g, 'Ä').split(";");
    if (wifiParts.length > 0) {
      const encryptionPrefix = "T:";
      const ssidPrefix = "S:";
      const passwordPrefix = "P:";
      const hiddenPrefix = "H:";
      wifiParts.forEach(
        (part) => {
          if (part.toUpperCase().substr(0, encryptionPrefix.length) === encryptionPrefix) {
            const method = part.substr(encryptionPrefix.length) as 'WPA' | 'WEP' | 'nopass';
            this.wifiEncryption = method === 'nopass' ? 'NONE' : (method === 'WPA' ? 'WPA' : 'WEP');
          }
          if (part.toUpperCase().substr(0, ssidPrefix.length) === ssidPrefix) {
            this.wifiSSID = part.substr(ssidPrefix.length).replace("ä", ";").replace("Ä", ":");
          }
          if (part.toUpperCase().substr(0, passwordPrefix.length) === passwordPrefix) {
            this.wifiPassword = part.substr(passwordPrefix.length).replace("ä", ";").replace("Ä", ":");
          }
          if (part.toUpperCase().substr(0, hiddenPrefix.length) === hiddenPrefix) {
            this.wifiHidden = part.substr(hiddenPrefix.length).toLowerCase() === "true" ? true : false;
          }
        }
      );
    }
  }

  returnScanPage(): void {
    this.router.navigate(['/scan'], { replaceUrl: true });
  }

  async addBookmark() {
    const flag = await this.env.saveBookmark(this.qrCodeContent);
    if (flag === true) {
      this.presentToast(this.translate.instant("MSG.BOOKMARKED"), 1000, "bottom", "center", "short");
    } else {
      this.presentToast(this.translate.instant("MSG.ALREADY_BOOKMARKED"), 1000, "bottom", "center", "short");
    }
    if (this.env.bookmarks.find(x => x.text === this.qrCodeContent)) {
      this.bookmarked = true;
    } else {
      this.bookmarked = false;
    }
  }

  async removeBookmark() {
    await this.env.deleteBookmark(this.qrCodeContent);
    this.presentToast(this.translate.instant("MSG.UNBOOKMARKED"), 1000, "bottom", "center", "short");
    if (this.env.bookmarks.find(x => x.text === this.qrCodeContent)) {
      this.bookmarked = true;
    } else {
      this.bookmarked = false;
    }
  }

  async openActionSheet() {
    const buttons = [];
    switch (this.contentType) {
      case "url":
        buttons.push({
          text: this.translate.instant("BROWSE_WEBSITE"),
          handler: async () => {
            this.browseWebsite();
          }
        });
        break;
      case "contact":
        buttons.push({
          text: this.translate.instant("ADD_CONTACT"),
          handler: async () => {
            this.addContact();
          }
        });
        break;
      case "phone":
        buttons.push({
          text: this.translate.instant("CALL"),
          handler: async () => {
            this.callPhone();
          }
        }, {
          text: this.translate.instant("ADD_CONTACT"),
          handler: async () => {
            this.addContact();
          }
        });
        break;
      case "sms":
        if (this.smsContent) {
          buttons.push({
            text: this.translate.instant("SEND_MESSAGE"),
            handler: async () => {
              this.sendSms();
            }
          });
        }
        buttons.push({
          text: this.translate.instant("ADD_CONTACT"),
          handler: async () => {
            this.addContact();
          }
        });
        break;
      case "email":
        buttons.push({
          text: this.translate.instant("SEND_EMAIL"),
          handler: async () => {
            this.sendEmail();
          }
        });
        break;
    }
    const actionSheet = await this.actionSheetController.create({
      mode: 'ios',
      buttons: buttons
    });
    await actionSheet.present();
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
