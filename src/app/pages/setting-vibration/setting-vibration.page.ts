import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-vibration',
  templateUrl: './setting-vibration.page.html',
  styleUrls: ['./setting-vibration.page.scss'],
})
export class SettingVibrationPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveVibration() {
    await Preferences.set({ key: this.env.KEY_VIBRATION, value: this.env.vibration });
  }
}
