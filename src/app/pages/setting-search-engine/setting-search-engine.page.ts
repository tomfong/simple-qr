import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-setting-search-engine',
    templateUrl: './setting-search-engine.page.html',
    styleUrls: ['./setting-search-engine.page.scss'],
    standalone: false
})
export class SettingSearchEnginePage {

  constructor(
    public translate: TranslateService,
    public env: EnvService,
  ) { }

  async saveSearchEngine() {
   await Preferences.set({ key: this.env.KEY_SEARCH_ENGINE, value: this.env.searchEngine });
  }


}
