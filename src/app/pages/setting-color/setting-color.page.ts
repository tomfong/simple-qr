import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-color',
  templateUrl: './setting-color.page.html',
  styleUrls: ['./setting-color.page.scss'],
})
export class SettingColorPage {

  constructor(
    public translate: TranslateService,
    public env: EnvService,
    private overlayContainer: OverlayContainer,
  ) { }

  async saveColorTheme() {
    this.env.toggleColorTheme();
    await this.env.storageSet("color", this.env.selectedColorTheme);
  }

}
