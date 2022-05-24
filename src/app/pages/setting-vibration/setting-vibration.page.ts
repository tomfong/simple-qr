import { Component } from '@angular/core';
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
    await this.env.storageSet("vibration", this.env.vibration);
  }
}
