import { Component } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    translate: TranslateService,
    public config: ConfigService,
    private platform: Platform,
    private localNotifications: LocalNotifications
  ) {
    translate.setDefaultLang(config.language);
    this.platform.ready().then(
      async () => {
        await this.localNotifications.requestPermission();
      }
    );
  }
}
