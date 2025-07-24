import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-setting-color',
    templateUrl: './setting-color.page.html',
    styleUrls: ['./setting-color.page.scss'],
    standalone: false
})
export class SettingColorPage {

  constructor(
    public translate: TranslateService,
    public env: EnvService,
    private overlayContainer: OverlayContainer,
  ) { }

  async saveColorTheme() {
    await this.env.toggleColorTheme();
    await Preferences.set({ key: this.env.KEY_COLOR, value: this.env.selectedColorTheme });
  }

}
