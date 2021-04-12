import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage {

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
    private appVersion: AppVersion,
    private device: Device,
  ) { 
    
  }

  setLanguage() {
    this.router.navigate(['setting-language', { t: new Date().getTime() }]);
  }

  setColorTheme() {
    this.router.navigate(['setting-color', { t: new Date().getTime() }]);
  }

  setCameraPause() {
    this.router.navigate(['setting-camera-pause', { t: new Date().getTime() }]);
  }

  setScanRecordLogging() {
    this.router.navigate(['setting-record', { t: new Date().getTime() }]);
  }

  openRepoUrl(): void {
    window.open(this.env.GITHUB_REPO_URL, '_system');
  }

  async supportDeveloper() {
    this.router.navigate(['support-developer', { t: new Date().getTime() }]);
  }

  async reportBug() {
    const now = moment();
    const datetimestr1 = now.format("YYYYMMDDHHmmss");
    const datetimestr2 = now.format("YYYY-MM-DD HH:mm:ss ZZ");
    const appVersion = await this.appVersion.getVersionNumber();
    const model = `${this.device.manufacturer} ${this.device.model}`;
    const os = this.platform.is("android")? "Android" : (this.platform.is("ios")? "iOS" : "Other");
    const osVersion = this.device.version;
    const mailtoContent = `
      mailto:tomfong.dev@gmail.com?subject=Simple%20QR%20-%20Report%20Issue%20(%23${datetimestr1})&body=Developer%2C%0A%0AI%20would%20like%20to%20report%20an%20issue%20regarding%20Simple%20QR.%0A%0ADate%20%26%20Time%0A${datetimestr2}%0A%0AApp%20Version%0A${appVersion}%0A%0AModel%0A${model}%0A%0APlatform%0A${os}%20${osVersion}%0A%0ADescription%0D%0A(describe%20the%20issue%20below)%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0AThank%20you.%0D%0A%0D%0ABest%2C%0D%0AUser
    `;  // must be in one line
    window.open(mailtoContent, '_system');
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
