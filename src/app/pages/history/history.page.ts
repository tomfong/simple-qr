import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { EnvService } from 'src/app/services/env.service';
import * as moment from 'moment';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage {

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public config: ConfigService,
    public env: EnvService,
  ) { }

  maskDatetime(date: Date): string {
    if (!date) {
      return "-";
    }
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  }

  returnScanPage(): void {
    this.router.navigate(['/scan'], { replaceUrl: true });
  }

}
