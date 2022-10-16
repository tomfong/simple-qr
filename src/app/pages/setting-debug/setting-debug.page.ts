import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-debug',
  templateUrl: './setting-debug.page.html',
  styleUrls: ['./setting-debug.page.scss'],
})
export class SettingDebugPage {

  constructor(
    private translate: TranslateService,
    public env: EnvService,
  ) { }

  async saveDebugMode() {
    await Preferences.set({ key: this.env.KEY_DEBUG_MODE, value: this.env.debugMode });
  }

}
