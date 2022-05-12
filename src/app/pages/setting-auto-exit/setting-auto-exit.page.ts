import { Component } from '@angular/core';
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
    await this.env.storageSet("autoExitAppMin", this.env.autoExitAppMin);
  }
}
