import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-setting-orientation',
    templateUrl: './setting-orientation.page.html',
    styleUrls: ['./setting-orientation.page.scss'],
    standalone: false
})
export class SettingOrientationPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveOrientation() {
    await this.env.toggleOrientationChange();
    await Preferences.set({ key: this.env.KEY_ORIENTATION, value: this.env.orientation });
  }
}
