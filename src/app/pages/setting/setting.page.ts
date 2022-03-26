import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
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
    private platform: Platform,
  ) { 
    
  }

  get isAndroid(): boolean {
    return this.platform.is('android');
  }

  setLanguage() {
    this.router.navigate(['setting-language']);
  }

  setColorTheme() {
    this.router.navigate(['setting-color']);
  }

  setVibration() {
    this.router.navigate(['setting-vibration']);
  }

  setScanRecordLogging() {
    this.router.navigate(['setting-record']);
  }

  setSearchEngine() {
    this.router.navigate(['setting-search-engine']);
  }

  navigateAbout() {
    this.router.navigate(['about']);
  }

  async resetApp() {
    const alert = await this.alertController.create({
      header: this.translate.instant('RESET_APP'),
      message: this.translate.instant('MSG.RESET_APP'),
      cssClass: ['alert-bg'],
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

  async confirmExitApp(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('EXIT_APP'),
      message: this.translate.instant('MSG.EXIT_APP'),
      cssClass: ['alert-bg'],
      buttons: [
        {
          text: this.translate.instant('YES'),
          handler: () => {
            navigator['app'].exitApp();
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
