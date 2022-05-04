import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    private translate: TranslateService,
    private env: EnvService,
    private platform: Platform,
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private alertController: AlertController,
  ) {
    if (this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(-1, async () => {
        if (!this.routerOutlet.canGoBack()) {
          if (this.router.url?.startsWith("/tabs/result")) {
            if (this.env.viewResultFrom != null) {
              const from = this.env.viewResultFrom;
              this.router.navigate([`${from}`], { replaceUrl: true });
            }
          } else {
            if (this.router.url?.startsWith("/tabs")) {
              if (this.router.url != this.env.startPage) {
                this.router.navigate([this.env.startPage], { replaceUrl: true });
              } else {
                await this.confirmExitApp();
              }
            }
          }
        }
      });
    }
  }

  async ionViewDidEnter() {
    if (this.env.firstAppLoad) {
      this.env.firstAppLoad = false;
      await SplashScreen.show();
      await this.env.init();
      await this.router.navigate([this.env.startPage], { replaceUrl: true });
    }
    await this.loadPatchNote();
  }

  async loadPatchNote() {
    const storageKey = this.platform.is('ios') ? this.env.IOS_PATCH_NOTE_STORAGE_KEY : this.env.AN_PATCH_NOTE_STORAGE_KEY;
    await this.env.storageGet(storageKey).then(
      async value => {
        if (value != null) {
          this.env.notShowUpdateNotes = (value === 'yes' ? true : false);
        } else {
          this.env.notShowUpdateNotes = false;
        }
        await this.env.storageSet(storageKey, 'yes');
        if (this.env.notShowUpdateNotes === false) {
          this.env.notShowUpdateNotes = true;
          await this.showUpdateNotes();
        }
      }
    );
  }

  async showUpdateNotes() {
    const alert = await this.alertController.create({
      header: this.translate.instant("UPDATE_NOTES"),
      subHeader: this.env.appVersionNumber,
      message: this.platform.is('ios') ? this.translate.instant("UPDATE.UPDATE_NOTES_IOS") : this.translate.instant("UPDATE.UPDATE_NOTES_ANDROID"),
      buttons: [
        {
          text: this.translate.instant("OK"),
          handler: () => true,
        },
        {
          text: this.translate.instant("GO_STORE_RATE"),
          handler: () => {
            if (this.platform.is('android')) {
              this.openGooglePlay();
            } else if (this.platform.is('ios')) {
              this.openAppStore();
            }
          }
        }
      ],
      cssClass: ['left-align', 'alert-bg']
    });
    await alert.present();
  }

  openGooglePlay(): void {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
  }

  openAppStore(): void {
    window.open(this.env.APP_STORE_URL, '_system');
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

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }
}
