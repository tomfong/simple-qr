import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-search-engine',
  templateUrl: './setting-search-engine.page.html',
  styleUrls: ['./setting-search-engine.page.scss'],
})
export class SettingSearchEnginePage {

  constructor(
    public translate: TranslateService,
    public env: EnvService,
  ) { }

  async saveSearchEngine() {
   await this.env.storageSet("search-engine", this.env.searchEngine);
  }


}
