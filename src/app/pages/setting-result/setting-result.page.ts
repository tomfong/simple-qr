import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-result',
  templateUrl: './setting-result.page.html',
  styleUrls: ['./setting-result.page.scss'],
})
export class SettingResultPage {

  constructor(
    public env: EnvService,
    private router: Router,
  ) { }

  setAutoMaxBrightness() {
    this.router.navigate(['setting-auto-brightness']);
  }

  setErrorCorrectionLevel() {
    this.router.navigate(['setting-qr-ecl']);
  }

  setSearchEngine() {
    this.router.navigate(['setting-search-engine']);
  }

  setResultPageButtons() {
    this.router.navigate(['setting-result-buttons']);
  }
}
