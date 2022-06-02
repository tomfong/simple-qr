import { Component } from '@angular/core';
import { Toast } from '@capacitor/toast';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage {

  tapAppVersionTimes: number = 0;

  constructor(
    private translate: TranslateService,
    private platform: Platform,
    public env: EnvService,
    public alertController: AlertController,
  ) { }

  get isAndroid(): boolean {
    return this.platform.is('android');
  }

  get isIos(): boolean {
    return this.platform.is('ios');
  }

  openRepoUrl(): void {
    window.open(this.env.GITHUB_REPO_URL, '_system');
  }

  openGooglePlay(): void {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
  }

  openAppStore(): void {
    window.open(this.env.APP_STORE_URL, '_system');
  }

  async showBarcodeType() {
    const alert = await this.alertController.create({
      header: this.translate.instant("SUPPORTED_TYPE"),
      message: this.translate.instant("MSG.BARCODE_TYPE"),
      buttons: [this.translate.instant("CLOSE")],
      cssClass: ['left-align', 'alert-bg']
    });
    await alert.present();
  }

  async showUpdateNotes() {
    const alert = await this.alertController.create({
      header: this.translate.instant("PATCH_NOTES"),
      message: this.platform.is('ios') ? this.translate.instant("UPDATE.UPDATE_NOTES_IOS") : this.translate.instant("UPDATE.UPDATE_NOTES_ANDROID"),
      buttons: [
        {
          text: this.translate.instant("CLOSE"),
          handler: () => true,
        },
        {
          text: this.translate.instant("VIEW_GITHUB"),
          handler: () => {
            this.openGitHubRelease();
          }
        }
      ],
      cssClass: ['left-align', 'alert-bg']
    });
    await alert.present();
  }

  openGitHubRelease() {
    window.open(this.env.GITHUB_RELEASE_URL, '_system');
  }

  viewPrivacyPolicy(): void {
    window.open(this.env.PRIVACY_POLICY, '_system');
  }

  async reportBug() {
    const mailContent = this.env.getBugReportMailContent();
    window.open(mailContent, '_system');
  }

  async tapAppVersion() {
    this.tapAppVersionTimes++;
    if (this.env.debugMode != 'on') {
      if (this.tapAppVersionTimes >= 5) {
        this.env.debugMode = 'on';
        await this.env.storageSet("debug-mode-on", 'on');
        await Toast.show({
          text: this.translate.instant("MSG.DEBUG_MODE_ON"),
          duration: "short",
          position: "bottom"
        });
      }
    }
  }

}
