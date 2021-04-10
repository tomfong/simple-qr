import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { EnvService } from 'src/app/services/env.service';
import * as moment from 'moment';
import { ScanRecord } from 'src/app/models/scan-record';

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
    public config: ConfigService,
    public env: EnvService,
    public toastController: ToastController,
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

  async removeRecord(record: ScanRecord) {
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteScanRecord(record.id);
    this.deleteToast = await this.toastController.create({
      message: `You can undo the deletion in 5 seconds`,
      duration: 5000,
      mode: "ios",
      color: "light",
      position: "bottom",
      buttons: [
        {
          text: 'Undo',
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
      header: 'Remove All',
      message: 'Are you sure to remove all records? <b>This action cannot be undone.</b>',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: async () => {
            await this.env.deleteAllScanRecords();
          }
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
