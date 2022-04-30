import { Component } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-qr-ecl',
  templateUrl: './setting-qr-ecl.page.html',
  styleUrls: ['./setting-qr-ecl.page.scss'],
})
export class SettingQrEclPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveErrorCorrectionLevel() {
    await this.env.storageSet("error-correction-level", this.env.errorCorrectionLevel);
  }
}
