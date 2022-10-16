import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-auto-exit',
  templateUrl: './setting-auto-exit.page.html',
  styleUrls: ['./setting-auto-exit.page.scss'],
})
export class SettingAutoExitPage{

  constructor(
    public env: EnvService,
  ) { }

  async saveAutoExitAppMin() {
    await Preferences.set({ key: this.env.KEY_AUTO_EXIT_MIN, value: JSON.stringify(this.env.autoExitAppMin) });
  }
}
