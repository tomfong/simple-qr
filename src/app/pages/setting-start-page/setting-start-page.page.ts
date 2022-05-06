import { Component } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';
import { fadeIn } from 'src/app/utils/animations';

@Component({
  selector: 'app-setting-start-page',
  templateUrl: './setting-start-page.page.html',
  styleUrls: ['./setting-start-page.page.scss'],
  animations: [fadeIn]
})
export class SettingStartPagePage {

  constructor(
    public env: EnvService,
  ) { }

  async saveStartPage() {
    await this.env.storageSet("start-page", this.env.startPage);
  }

  async saveStartPageHeader() {
    await this.env.storageSet("start-page-header", this.env.startPageHeader);
  }

  async saveHistoryPageStartSegment() {
    await this.env.storageSet("history-page-start-segment", this.env.historyPageStartSegment);
  }
}
