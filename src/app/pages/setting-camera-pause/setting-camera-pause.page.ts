import { Component } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-camera-pause',
  templateUrl: './setting-camera-pause.page.html',
  styleUrls: ['./setting-camera-pause.page.scss'],
})
export class SettingCameraPausePage {

  constructor(
    public env: EnvService,
  ) { }

  async saveCameraPause() {
    await this.env.storageSet("camera-pause-timeout", this.env.cameraPauseTimeout);
  }

}
