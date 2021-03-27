import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.page.html',
  styleUrls: ['./create-contact.page.scss'],
})
export class CreateContactPage implements OnInit {

  name: ContactName;
  @Input() givenName: string = '';
  @Input() familyName: string = '';
  
  phoneNumberObject: ContactField;
  phoneNumberTypes = [{ text: 'Other', value: 'other' }, { text: 'Mobile', value: 'mobile' }, { text: 'Home', value: 'home' }, { text: 'Work', value: 'work' }];
  phoneNumberType: string = 'other';
  @Input() phoneNumber: string = '';

  emailObject: ContactField;
  emailTypes = [{ text: 'Other', value: 'other' }, { text: 'Home', value: 'home' }, { text: 'Work', value: 'work' }];
  emailType: string = 'other';
  @Input() emailAddress: string = '';

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() { }

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
