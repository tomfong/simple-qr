import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';
import * as moment from 'moment';
import { ScanRecord } from 'src/app/models/scan-record';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage {

  deleteToast: HTMLIonToastElement;

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
  ) { }

  async ionViewWillLeave() {
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
  }

  maskDatetime(date: Date): string {
    if (!date) {
      return "-";
    }
    if (this.translate.currentLang === 'zh-HK') {
      return moment(date).format("YYYY年M月D日 HH:mm:ss");
    }
    return moment(date).format("YYYY-MMM-DD HH:mm:ss");
  }

  async processQrCode(scannedData: string): Promise<void> {
    const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
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

  async removeRecord(record: ScanRecord) {
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteScanRecord(record.id);
    this.deleteToast = await this.toastController.create({
      message: this.translate.instant('MSG.UNDO_DELETE'),
      duration: 5000,
      mode: "ios",
      color: "light",
      position: "bottom",
      buttons: [
        {
          text: this.translate.instant('UNDO'),
          side: 'end',
          handler: async () => {
            await this.env.undoScanRecordDeletion(record);
            this.deleteToast.dismiss();
          }
        }
      ]
    });
    await this.deleteToast.present();
  
  }

  async removeAllRecords() {
    const alert = await this.alertController.create({
      header: this.translate.instant('REMOVE_ALL'),
      message: this.translate.instant('MSG.REMOVE_ALL_RECORD'),
      buttons: [
        {
          text: this.translate.instant('YES'),
          handler: async () => {
            await this.env.deleteAllScanRecords();
          }
        },
        {
          text: this.translate.instant('NO'),
          role: 'cancel'
        },
      ]
    });
    alert.present();
  }

  async presentAlert(msg: string, head: string, buttonText: string, buttonless: boolean = false): Promise<HTMLIonAlertElement> {
    let alert: any;
    if (!buttonless) {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [buttonText]
      });
    } else {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [],
        backdropDismiss: false
      });
    }
    await alert.present();
    return alert;
  }
}
