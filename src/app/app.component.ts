import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toast } from '@capacitor/toast';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from './services/env.service';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {

  constructor(
    translate: TranslateService,
    public env: EnvService,
    private platform: Platform,
  ) {
    translate.addLangs(this.env.languages);
    translate.setDefaultLang('en');
    if (this.platform.is('ios')) {
      App.addListener('appStateChange', async ({ isActive }) => {
        if (env.isDebugging) {
          this.presentToast(`App state changed. Is active?: ${isActive}`, "short", "bottom");
        }
        if (isActive) {
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 300);
        } else {
          await SplashScreen.show({
            autoHide: false
          });
        }
      });
    }
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }
}
