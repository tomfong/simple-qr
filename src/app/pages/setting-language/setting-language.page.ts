import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-setting-language',
    templateUrl: './setting-language.page.html',
    styleUrls: ['./setting-language.page.scss'],
    standalone: false
})
export class SettingLanguagePage {

  constructor(
    public translate: TranslateService,
    public env: EnvService,
  ) { }

  async saveLanguage() {
    this.env.toggleLanguageChange();
    await Preferences.set({ key: this.env.KEY_LANGUAGE, value: this.env.selectedLanguage });
  }
}
