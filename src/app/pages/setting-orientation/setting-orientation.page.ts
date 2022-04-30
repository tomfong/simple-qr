import { Component } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-orientation',
  templateUrl: './setting-orientation.page.html',
  styleUrls: ['./setting-orientation.page.scss'],
})
export class SettingOrientationPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveOrientation() {
    await this.env.toggleOrientationChange();
    await this.env.storageSet("orientation", this.env.orientation);
  }
}
