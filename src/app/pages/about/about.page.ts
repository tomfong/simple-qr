import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {

  constructor(
    private translate: TranslateService,
    private platform: Platform,
    public env: EnvService,
    public alertController: AlertController,
  ) { }

  get isAndroid(): boolean {
    return this.platform.is('android');
  }

  openRepoUrl(): void {
    window.open(this.env.GITHUB_REPO_URL, '_system');
  }

  openGooglePlay(): void {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
  }

  async showBarcodeType() {
    const alert = await this.alertController.create({
      header: this.translate.instant("SUPPORTED_TYPE"),
      message: this.translate.instant("MSG.BARCODE_TYPE"),
      buttons: [this.translate.instant("OK")],
      cssClass: 'left-align'
    });
    await alert.present();
  }

  async showUpdateNotes() {
    const alert = await this.alertController.create({
      header: this.translate.instant("UPDATE_NOTES"),
      subHeader: this.env.appVersionNumber,
      message: this.translate.instant("UPDATE.UPDATE_NOTES"),
      buttons: [this.translate.instant("OK")],
      cssClass: 'left-align'
    });
    await alert.present();
  }

  viewPrivacyPolicy(): void {
    window.open(this.env.PRIVACY_POLICY, '_system');
  }

  async reportBug() {
    const mailContent = await this.env.getBugReportMailContent();
    window.open(mailContent, '_system');
  }

}
