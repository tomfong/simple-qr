import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-auto-brightness',
  templateUrl: './setting-auto-brightness.page.html',
  styleUrls: ['./setting-auto-brightness.page.scss'],
})
export class SettingAutoBrightnessPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveAutoMaxBrightness() {
    await this.env.storageSet("auto-max-brightness", this.env.autoMaxBrightness);
  }

}
