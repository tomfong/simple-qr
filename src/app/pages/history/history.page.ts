import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonItemSliding, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';
import * as moment from 'moment';
import { ScanRecord } from 'src/app/models/scan-record';
import { TranslateService } from '@ngx-translate/core';
import { Bookmark } from 'src/app/models/bookmark';
import { HistoryTutorialPage } from 'src/app/modals/history-tutorial/history-tutorial.page';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage {

  segmentModel: 'history' | 'bookmarks' = "history";

  deleteToast: HTMLIonToastElement;

  scanRecords: ScanRecord[] = [];
  bookmarks: Bookmark[] = [];

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
    public modalController: ModalController,
  ) { }

  async loadItems() {
    this.scanRecords = this.env.scanRecords;
    this.bookmarks = this.env.bookmarks;
  }

  async ionViewDidEnter() {
    const loading = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
    await this.loadItems();
    loading.dismiss();
    if (this.env.notShowHistoryTutorial === false) {
      this.env.notShowHistoryTutorial = true;
      this.env.storageSet("not-show-history-tutorial", 'yes');
      const modal = await this.modalController.create({
        component: HistoryTutorialPage,
        cssClass: 'tutorial-modal-page',
        componentProps: {
        }
      });
      modal.present();
    }
  }

  async ionViewWillLeave() {
    if (this.deleteToast) {
      this.deleteToast.dismiss();
      this.deleteToast = undefined;
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

  segmentChanged(ev: any) { }

  async addFavourite(record: ScanRecord, slidingItem: IonItemSliding) {
    slidingItem.close();
    const flag = await this.env.saveBookmark(record.text);
    await this.loadItems();
    if (flag === true) {
      this.presentToast(this.translate.instant("MSG.BOOKMARKED"), 1000, "bottom", "center", "short");
    } else {
      this.presentToast(this.translate.instant("MSG.ALREADY_BOOKMARKED"), 1000, "bottom", "center", "short");
    }
  }

  async removeBookmark(bookmark: Bookmark, slidingItem: IonItemSliding) {
    slidingItem.close();
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteBookmark(bookmark.text);
    await this.loadItems();
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
            await this.env.undoBookmarkDeletion(bookmark);
            await this.loadItems();
            this.deleteToast.dismiss();
          }
        }
      ]
    });
    await this.deleteToast.present();
  }

  async removeRecord(record: ScanRecord, slidingItem: IonItemSliding) {
    slidingItem.close();
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteScanRecord(record.id);
    await this.loadItems();
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
            await this.loadItems();
            this.deleteToast.dismiss();
          }
        }
      ]
    });
    await this.deleteToast.present();

  }

  async removeAll() {
    if (this.segmentModel === 'history') {
      const alert = await this.alertController.create({
        header: this.translate.instant('REMOVE_ALL'),
        message: this.translate.instant('MSG.REMOVE_ALL_RECORD'),
        buttons: [
          {
            text: this.translate.instant('YES'),
            handler: async () => {
              await this.env.deleteAllScanRecords();
              await this.loadItems();
            }
          },
          {
            text: this.translate.instant('NO'),
            role: 'cancel'
          },
        ]
      });
      alert.present();
    } else if (this.segmentModel === 'bookmarks') {
      const alert = await this.alertController.create({
        header: this.translate.instant('REMOVE_ALL'),
        message: this.translate.instant('MSG.REMOVE_ALL_BOOKMARKS'),
        buttons: [
          {
            text: this.translate.instant('YES'),
            handler: async () => {
              await this.env.deleteAllBookmarks();
              await this.loadItems();
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

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg,
      mode: "ios"
    });
    await loading.present();
    return loading;
  }

  async presentToast(msg: string, msTimeout: number, pos: "top" | "middle" | "bottom", align: "left" | "center", size: "short" | "long") {
    if (size === "long") {
      if (align === "left") {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-start-toast",
          position: pos
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-center-toast",
          position: pos
        });
        toast.present();
      }
    } else {
      if (align === "left") {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-start-short-toast",
          position: pos
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-center-short-toast",
          position: pos
        });
        toast.present();
      }
    }
  }
}
