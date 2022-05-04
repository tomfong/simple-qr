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

  setErrorCorrectionLevel() {
    this.router.navigate(['setting-qr-ecl']);
  }

  setAutoMaxBrightness() {
    this.router.navigate(['setting-auto-brightness']);
  }

  setSearchEngine() {
    this.router.navigate(['setting-search-engine']);
  }

  setStartPage() {
    this.router.navigate(['setting-start-page']);
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
          text: this.translate.instant('FULL_RESET'),
          handler: async () => {
            const loading = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
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
            loading.dismiss();
            this.presentToast(this.translate.instant("DONE"), "short", "bottom");
          }
        },
        {
          text: this.translate.instant('ONLY_RESET_DATA'),
          handler: async () => {
            const loading = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
            await this.env.resetData();
            loading.dismiss();
            this.presentToast(this.translate.instant("DONE"), "short", "bottom");
          }
        },
        {
          text: this.translate.instant('ONLY_RESET_SETTING'),
          handler: async () => {
            const loading = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
            await this.env.resetSetting();
            loading.dismiss();
            this.presentToast(this.translate.instant("DONE"), "short", "bottom");
          }
        },
        {
          text: this.translate.instant('CANCEL'),
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

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg
    });
    await loading.present();
    return loading;
  }
}
