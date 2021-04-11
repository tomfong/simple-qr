import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { VCardContact } from 'src/app/models/v-card-contact';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.page.html',
  styleUrls: ['./create-contact.page.scss'],
})
export class CreateContactPage implements OnInit {

  defaultText: string = "Default / Other";
  mobileText: string = "Mobile";
  homeText: string = "Home";
  workText: string = "Work";

  @Input() vCardContact: VCardContact;

  name: ContactName;
  @Input() givenName: string = '';
  @ViewChild('givenNameInput') givenNameInput: MatInput;
  @Input() familyName: string = '';

  phoneNumberObject: ContactField;
  phoneNumberTypes = [{ text: this.defaultText, value: 'other' }, { text: this.mobileText, value: 'mobile' }, { text: this.homeText, value: 'home' }, { text: this.workText, value: 'work' }];
  phoneNumberType: string = 'other';
  @Input() phoneNumber: string = '';

  emailObject: ContactField;
  emailTypes = [{ text: this.defaultText, value: 'other' }, { text: this.homeText, value: 'home' }, { text: this.workText, value: 'work' }];
  emailType: string = 'other';
  @Input() emailAddress: string = '';

  constructor(
    public modalController: ModalController,
    public toastController: ToastController,
    public translate: TranslateService,
    public env: EnvService,
  ) { 
    this.defaultText = this.translate.instant("DEFAULT_OR_OTHER");
    this.mobileText = this.translate.instant("MOBILE");
    this.homeText = this.translate.instant("HOME");
    this.workText = this.translate.instant("WORK");
    this.phoneNumberTypes = [{ text: this.defaultText, value: 'other' }, { text: this.mobileText, value: 'mobile' }, { text: this.homeText, value: 'home' }, { text: this.workText, value: 'work' }];
    this.emailTypes = [{ text: this.defaultText, value: 'other' }, { text: this.homeText, value: 'home' }, { text: this.workText, value: 'work' }];
  }

  ngOnInit() {
    if (this.vCardContact) {
      if (this.vCardContact.fullName) {
        this.givenName = this.vCardContact.fullName;
      }
      if (this.vCardContact.givenName && this.vCardContact.familyName) {
        this.givenName = this.vCardContact.givenName;
        this.familyName = this.vCardContact.familyName;
      }
      if (this.vCardContact.workPhoneNumber) {
        this.phoneNumber = this.vCardContact.workPhoneNumber;
        this.phoneNumberType = "work";
      }
      if (this.vCardContact.homePhoneNumber) {
        this.phoneNumber = this.vCardContact.homePhoneNumber;
        this.phoneNumberType = "home";
      }
      if (this.vCardContact.mobilePhoneNumber) {
        this.phoneNumber = this.vCardContact.mobilePhoneNumber;
        this.phoneNumberType = "mobile";
      }
      if (this.vCardContact.defaultPhoneNumber) {
        this.phoneNumber = this.vCardContact.defaultPhoneNumber;
        this.phoneNumberType = "other";
      }
      if (this.vCardContact.workEmail) {
        this.emailAddress = this.vCardContact.workEmail;
        this.emailType = "work";
      }
      if (this.vCardContact.homeEmail) {
        this.emailAddress = this.vCardContact.homeEmail;
        this.emailType = "home";
      }
      if (this.vCardContact.defaultEmail) {
        this.emailAddress = this.vCardContact.defaultEmail;
        this.emailType = "other";
      }
    }
  }

  closeModal(): void {
    this.modalController.dismiss({ cancelled: true });
  }

  saveContent(): void {
    if (this.givenName.trim().length <= 0) {
      this.presentToast(this.translate.instant("MSG.GIVE_NAME_CONTACT"), 2000, "bottom", "center", "long");
      this.givenNameInput.focus();
      return;
    }
    const name = new ContactName('', this.familyName.trim(), this.givenName.trim());
    const phone = new ContactField(this.phoneNumberType, this.phoneNumber, true);
    const email = new ContactField(this.emailType, this.emailAddress, true);
    this.modalController.dismiss({ cancelled: false, name, phone, email });
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
