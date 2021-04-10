import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-language',
  templateUrl: './setting-language.page.html',
  styleUrls: ['./setting-language.page.scss'],
})
export class SettingLanguagePage {

  constructor(
    public translate: TranslateService,
    public env: EnvService,
  ) { }

  async saveLanguage() {
    if (this.env.language === 'default') {
      const browserLang = this.translate.getBrowserCultureLang();
      if (browserLang.includes("zh", 0)) {
        this.translate.use("zh-HK");
      } else if (this.env.languages.includes(browserLang)) {
        this.translate.use(browserLang);
      } else {
        this.translate.use('en')
      }
    } else {
      this.translate.use(this.env.language);
    }
    await this.env.storageSet("language", this.env.language);
  }
}
