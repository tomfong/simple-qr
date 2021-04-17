import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage {

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
    public appVersion: AppVersion,
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
    const mailContent = await this.env.getBugReportMailContent();
    window.open(mailContent, '_system');
  }

  async resetApp() {
    const alert = await this.alertController.create({
      header: this.translate.instant('RESET_APP'),
      message: this.translate.instant('MSG.RESET_APP'),
      buttons: [
        {
          text: this.translate.instant('YES'),
          handler: async () => {
            await window.caches.keys().then(
              keys => {
                keys.forEach(
                  async key => {
                    await window.caches.delete(key);
                  }
                );
              }
            );
            await this.env.resetAll();
          }
        },
        {
          text: this.translate.instant('NO'),
          role: 'cancel'
        },
      ]
    });
    alert.present();
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
