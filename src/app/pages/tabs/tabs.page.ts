import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toast } from '@capacitor/toast';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss'],
    standalone: false
})
export class TabsPage {

  exitAppTimeout: NodeJS.Timeout;

  constructor(
    private translate: TranslateService,
    public env: EnvService,
    private platform: Platform,
    private router: Router,
    private alertController: AlertController,
  ) {
    this.platform.pause.subscribe(
      _ => {
        if (this.platform.is('android')) {
          if (this.env.autoExitAppMin != -1) {
            this.exitAppTimeout = setTimeout(
              () => {
                if (this.env.isDebugging) {
                  this.presentToast("App will be killed!", "short", "bottom");
                }
                navigator['app'].exitApp();
              }, this.env.autoExitAppMin * 60 * 1000
            )
            if (this.env.isDebugging) {
              this.presentToast("App will be destroyed after " + this.env.autoExitAppMin + " minutes", "short", "bottom");
            }
          } else {
            if (this.env.isDebugging) {
              this.presentToast("App won't be destroyed by itself", "short", "bottom");
            }
          }
        };
      }
    )
    this.platform.resume.subscribe(
      _ => {
        if (this.exitAppTimeout != null) {
          clearTimeout(this.exitAppTimeout);
          delete this.exitAppTimeout;
          if (this.env.isDebugging) {
            this.presentToast("Cleared Exit App Timeout", "short", "bottom");
          }
        }
      }
    )
  }

  async ionViewDidEnter() {
    if (this.env.firstAppLoad) {
      this.env.firstAppLoad = false;
      this.env.initObservable.subscribe(async value => {
        console.log(`tabs.page.ts - ionViewDidEnter() - initObservable value: ${value}`)
        if (value) {
          console.log(`tabs.page.ts - ionViewDidEnter() - env.startPage: ${this.env.startPage}`)
          await this.router.navigate([this.env.startPage], { replaceUrl: true });
        }
      });
    }
  }

  async showUpdateNotes() {
    const alert = await this.alertController.create({
      header: this.translate.instant("UPDATE_SUCCESSFULLY"),
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

  openGooglePlay(): void {
    window.open(this.env.GOOGLE_PLAY_URL, '_system');
  }

  openAppStore(): void {
    window.open(this.env.APP_STORE_URL, '_system');
  }

  openGitHubRelease() {
    window.open(this.env.GITHUB_RELEASE_URL, '_system');
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Light })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }
}
