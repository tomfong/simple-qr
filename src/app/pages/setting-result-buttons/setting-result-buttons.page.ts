import { Component } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-result-buttons',
  templateUrl: './setting-result-buttons.page.html',
  styleUrls: ['./setting-result-buttons.page.scss'],
})
export class SettingResultButtonsPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveResultPageButtons() {
    await this.env.storageSet("result-page-buttons", this.env.resultPageButtons);
  }

}
