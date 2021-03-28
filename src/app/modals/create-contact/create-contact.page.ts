import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VCardContact } from 'src/app/models/v-card-contact';

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.page.html',
  styleUrls: ['./create-contact.page.scss'],
})
export class CreateContactPage implements OnInit {

  @Input() vCardContact: VCardContact;

  name: ContactName;
  @Input() givenName: string = '';
  @Input() familyName: string = '';
  
  phoneNumberObject: ContactField;
  phoneNumberTypes = [{ text: 'Default / Other', value: 'other' }, { text: 'Mobile', value: 'mobile' }, { text: 'Home', value: 'home' }, { text: 'Work', value: 'work' }];
  phoneNumberType: string = 'other';
  @Input() phoneNumber: string = '';

  emailObject: ContactField;
  emailTypes = [{ text: 'Default / Other', value: 'other' }, { text: 'Home', value: 'home' }, { text: 'Work', value: 'work' }];
  emailType: string = 'other';
  @Input() emailAddress: string = '';

  constructor(
    public modalController: ModalController
  ) { }

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
    const name = new ContactName('', this.familyName.trim(), this.givenName.trim());
    const phone = new ContactField(this.phoneNumberType, this.phoneNumber, true);
    const email = new ContactField(this.emailType, this.emailAddress, true);
    this.modalController.dismiss({ cancelled: false, name, phone, email });
  }

}
