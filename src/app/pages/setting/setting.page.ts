import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Toast } from '@capacitor/toast';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
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

  setOrientation() {
    this.router.navigate(['setting-orientation']);
  }

  setVibration() {
    this.router.navigate(['setting-vibration']);
  }

  setScanRecordLogging() {
    this.router.navigate(['setting-record']);
  }

  goBackupRestore() {
    this.router.navigate(['backup-restore']);
  }

  setSearchEngine() {
    this.router.navigate(['setting-search-engine']);
  }

  setDebugMode() {
    this.router.navigate(['setting-debug']);
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
          text: this.translate.instant('EXIT'),
          handler: () => {
            navigator['app'].exitApp();
          }
        },
        {
          text: this.translate.instant('GO_STORE_RATE'),
          handler: () => {
            this.openGooglePlay();
          }
        }
      ]
    });
    await alert.present();
  }

  openGooglePlay(): void {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }
}
