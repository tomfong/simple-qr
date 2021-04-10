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
    return moment(date).format("YYYY-MMM-DD HH:mm:ss");
  }

  async processQrCode(scannedData: string): Promise<void> {
    const loading = await this.presentLoading("Please wait...");
    this.env.result = scannedData;
    this.router.navigate(['result', { t: new Date().getTime() }]).then(
      () => {
        loading.dismiss();
      }
    );
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg,
      mode: "ios"
    });
    await loading.present();
    return loading;
  }

}
