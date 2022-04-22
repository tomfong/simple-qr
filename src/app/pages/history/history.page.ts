import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonItemSliding, LoadingController, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';
import * as moment from 'moment';
import { ScanRecord } from 'src/app/models/scan-record';
import { TranslateService } from '@ngx-translate/core';
import { Bookmark } from 'src/app/models/bookmark';
import { HistoryTutorialPage } from 'src/app/modals/history-tutorial/history-tutorial.page';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import { MenuItem } from 'src/app/models/menu-item';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';

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

  firstLoad: boolean = true;

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
    public modalController: ModalController,
    public popoverController: PopoverController,
  ) { }

  async loadItems() {
    this.scanRecords = this.env.scanRecords;
    this.bookmarks = this.env.bookmarks;
  }

  async ionViewDidEnter() {
    await this.loadItems();
    this.firstLoad = false;
    if (this.env.notShowHistoryTutorial === false) {
      this.env.notShowHistoryTutorial = true;
      this.env.storageSet("not-show-history-tutorial", 'yes');
      await this.showTutorial();
    }
  }

  async ionViewWillLeave() {
    if (this.deleteToast) {
      this.deleteToast.dismiss();
      this.deleteToast = undefined;
    }
  }

  async showTutorial() {
    const modal = await this.modalController.create({
      component: HistoryTutorialPage,
      cssClass: 'tutorial-modal-page',
      componentProps: {
      }
    });
    modal.present();
  }

  maskDatetime(date: Date): string {
    if (!date) {
      return "-";
    }
    if (this.translate.currentLang === 'zh-HK' || this.translate.currentLang === 'zh-CN') {
      return moment(date).format("YYYY年M月D日 HH:mm:ss");
    }
    return moment(date).format("YYYY-MMM-DD HH:mm:ss");
  }

  async processQrCode(scannedData: string): Promise<void> {
    const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    this.env.result = scannedData;
    this.env.resultFormat = "";
    this.router.navigate(['tabs/result', { from: 'history', t: new Date().getTime() }], { state: { page: 'generate'}}).then(
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
      await this.presentToast(this.translate.instant("MSG.BOOKMARKED"), "short", "bottom");
    } else {
      await this.presentToast(this.translate.instant("MSG.ALREADY_BOOKMARKED"), "short", "bottom");
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
      duration: 2000,
      mode: "ios",
      color: "light",
      position: "top",
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
      duration: 2000,
      mode: "ios",
      color: "light",
      position: "top",
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
        cssClass: ['alert-bg'],
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
        cssClass: ['alert-bg'],
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

  goSetting() {
    this.router.navigate(['setting-record']);
  }

  async presentAlert(msg: string, head: string, buttonText: string, buttonless: boolean = false): Promise<HTMLIonAlertElement> {
    let alert: any;
    if (!buttonless) {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        cssClass: ['alert-bg'],
        buttons: [buttonText]
      });
    } else {
      alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [],
        cssClass: ['alert-bg'],
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

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }
}
