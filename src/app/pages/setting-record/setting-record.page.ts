import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-record',
  templateUrl: './setting-record.page.html',
  styleUrls: ['./setting-record.page.scss'],
})
export class SettingRecordPage {

  constructor(
    public translate: TranslateService,
    public env: EnvService,
  ) { }

  async saveScanRecord() {
    await this.env.storageSet("scan-record-logging", this.env.scanRecordLogging);
  }

}
