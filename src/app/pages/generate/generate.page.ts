import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.page.html',
  styleUrls: ['./generate.page.scss'],
})
export class GeneratePage {

  freeTxtText: string = "Free Text";
  urlText: string = "URL";
  contactText: string = "vCard Contact";
  phoneText: string = "Phone";
  smsText: string = "Message";
  emailText: string = "Email";
  wifiText: string = "WiFi";

  contentTypes: { text: string, value: "freeText" | "url" | "contact" | "phone" | "sms" | "email" | "wifi" }[] = [
    { text: this.freeTxtText, value: 'freeText' },
    { text: this.contactText, value: 'contact' },
    { text: this.emailText, value: 'email' },
    { text: this.phoneText, value: 'phone' },
    { text: this.smsText, value: 'sms' },
    { text: this.urlText, value: 'url' },
    { text: this.wifiText, value: 'wifi' },
  ];
  contentType: "freeText" | "url" | "contact" | "phone" | "sms" | "email" | "wifi" = "freeText";

  constructor(
    public toastController: ToastController,
    public translate: TranslateService,
    public env: EnvService,
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
      { text: this.contactText, value: 'contact' },
      { text: this.emailText, value: 'email' },
      { text: this.phoneText, value: 'phone' },
      { text: this.smsText, value: 'sms' },
      { text: this.urlText, value: 'url' },
      { text: this.wifiText, value: 'wifi' },
    ];
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

}
