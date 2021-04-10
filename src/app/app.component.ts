import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from './services/env.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    translate: TranslateService,
    public env: EnvService,
    private platform: Platform,
  ) {
    translate.addLangs(["en", "zh-HK"]);
    translate.setDefaultLang('en');
  }
}
