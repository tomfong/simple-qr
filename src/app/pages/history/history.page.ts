import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonItemSliding, LoadingController, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';
import * as moment from 'moment';
import { ScanRecord } from 'src/app/models/scan-record';
import { TranslateService } from '@ngx-translate/core';
import { Bookmark } from 'src/app/models/bookmark';
import { HistoryTutorialPage } from 'src/app/modals/history-tutorial/history-tutorial.page';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { BookmarkTutorialPage } from 'src/app/modals/bookmark-tutorial/bookmark-tutorial.page';

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

  isLoadingText: boolean = true;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
    public modalController: ModalController,
    public popoverController: PopoverController,
  ) { }

  firstLoadItems() {
    this.isLoadingText = true;
    this.scanRecords.length = 0;
    this.bookmarks.length = 0;
    const scanRecords = [...this.env.scanRecords];
    this.scanRecords = scanRecords.slice(0, 15);
    const bookmarks = [...this.env.bookmarks];
    this.bookmarks = bookmarks.slice(0, 15); 
    this.isLoadingText = false;
  }

  loadMoreScanRecords() {
    const scanRecords = [...this.env.scanRecords]
    this.scanRecords.push(...scanRecords.slice(this.scanRecords.length, this.scanRecords.length + 15));
  }

  loadMoreBookmarks() {
    const bookmarks = [...this.env.bookmarks]
    this.bookmarks.push(...bookmarks.slice(this.bookmarks.length, this.bookmarks.length + 15));
  }

  onLoadScanRecords(ev: any) {
    setTimeout(() => {
      ev.target.complete();
      this.loadMoreScanRecords();
      if (this.scanRecords.length === this.env.scanRecords.length) {
        ev.target.disabled = true;
      }
    }, 500);
  }

  onLoadBookmarks(ev: any) {
    setTimeout(() => {
      ev.target.complete();
      this.loadMoreBookmarks();
      if (this.bookmarks.length === this.env.bookmarks.length) {
        ev.target.disabled = true;
      }
    }, 500);
  }

  async ionViewDidEnter() {
    this.isLoadingText = true;
    setTimeout(
      async () => {
        this.firstLoadItems();
      }, 200
    );
    if (this.segmentModel == 'history') {
      if (this.env.notShowHistoryTutorial === false) {
        this.env.notShowHistoryTutorial = true;
        this.env.storageSet("not-show-history-tutorial", 'yes');
        await this.showHistoryTutorial();
      }
    } else if (this.segmentModel == 'bookmarks') {
      if (this.env.notShowBookmarkTutorial === false) {
        this.env.notShowBookmarkTutorial = true;
        this.env.storageSet("not-show-bookmark-tutorial", 'yes');
        await this.showBookmarkTutorial();
      }
    }
  }

  ionViewWillLeave() {
    if (this.deleteToast) {
      this.deleteToast.dismiss();
      this.deleteToast = undefined;
    }
  }

  ionViewDidLeave() {
    this.scanRecords.length = 0;
    this.bookmarks.length = 0;
  }

  async showHistoryTutorial() {
    const modal = await this.modalController.create({
      component: HistoryTutorialPage,
      componentProps: {
      }
    });
    modal.present();
  }

  async showBookmarkTutorial() {
    const modal = await this.modalController.create({
      component: BookmarkTutorialPage,
      componentProps: {
      }
    });
    modal.present();
  }

  maskDatetimeAndSource(date: Date, source: 'create' | 'view' | 'scan' | undefined): string {
    if (!date) {
      return "-";
    }
    if (this.translate.currentLang === 'zh-HK' || this.translate.currentLang === 'zh-CN') {
      switch (source) {
        case 'create':
          return moment(date).format("YYYY年M月D日 HH:mm:ss") + ' ' + this.translate.instant("CREATED");
        case 'view':
          return moment(date).format("YYYY年M月D日 HH:mm:ss") + ' ' + this.translate.instant("VIEWED");
        case 'scan':
          return moment(date).format("YYYY年M月D日 HH:mm:ss") + ' ' + this.translate.instant("SCANNED");
        default:
          return moment(date).format("YYYY年M月D日 HH:mm:ss");
      }
    } else {
      switch (source) {
        case 'create':
          return this.translate.instant("CREATED") + ' at ' + moment(date).format("YYYY-MMM-DD HH:mm:ss");
        case 'view':
          return this.translate.instant("VIEWED") + ' at ' + moment(date).format("YYYY-MMM-DD HH:mm:ss");
        case 'scan':
          return this.translate.instant("SCANNED") + ' at ' + moment(date).format("YYYY-MMM-DD HH:mm:ss");
        default:
          return moment(date).format("YYYY-MMM-DD HH:mm:ss");
      }
    }
    
  }

  getBarcodeFormat(barcodeType: string): string {
    switch (barcodeType) {
      case "UPC_A":
        return this.translate.instant("BARCODE_TYPE.UPC");
      case "UPC_E":
        return this.translate.instant("BARCODE_TYPE.UPC");
      case "UPC_EAN_EXTENSION":
        return this.translate.instant("BARCODE_TYPE.UPC");
      case "EAN_8":
        return this.translate.instant("BARCODE_TYPE.EAN");
      case "EAN_13":
        return this.translate.instant("BARCODE_TYPE.EAN");
      case "CODE_39":
        return this.translate.instant("BARCODE_TYPE.1D");
      case "CODE_39_MOD_43":
        return this.translate.instant("BARCODE_TYPE.1D");
      case "CODE_93":
        return this.translate.instant("BARCODE_TYPE.1D");
      case "CODE_128":
        return this.translate.instant("BARCODE_TYPE.1D");
      case "CODABAR":
        return this.translate.instant("BARCODE_TYPE.1D");
      case "ITF":
        return this.translate.instant("BARCODE_TYPE.1D");
      case "ITF_14":
        return this.translate.instant("BARCODE_TYPE.1D");
      case "AZTEC":
        return this.translate.instant("BARCODE_TYPE.AZTEC");
      case "DATA_MATRIX":
        return this.translate.instant("BARCODE_TYPE.DATA_MATRIX");
      case "MAXICODE":
        return this.translate.instant("BARCODE_TYPE.MAXICODE");
      case "PDF_417":
        return this.translate.instant("BARCODE_TYPE.PDF_417");
      case "QR_CODE":
        return this.translate.instant("BARCODE_TYPE.QR_CODE");
      case "RSS_14":
        return this.translate.instant("BARCODE_TYPE.RSS");
      case "RSS_EXPANDED":
        return this.translate.instant("BARCODE_TYPE.RSS");
      default:
        return this.env.resultFormat;
    }
  }

  async viewRecord(data: string): Promise<void> {
    this.isLoadingText = true;
    this.scanRecords.length = 0;
    this.bookmarks.length = 0;
    const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    this.env.result = data;
    this.env.resultFormat = "";
    this.router.navigate(['tabs/result', { from: 'history', t: new Date().getTime() }], { state: { source: 'view' } }).then(
      () => {
        loading.dismiss();
      }
    );
  }

  async segmentChanged(ev: any) { 
    if (ev?.detail?.value  == 'history') {
      if (this.env.notShowHistoryTutorial === false) {
        this.env.notShowHistoryTutorial = true;
        this.env.storageSet("not-show-history-tutorial", 'yes');
        await this.showHistoryTutorial();
      }
    } else if (ev?.detail?.value == 'bookmarks') {
      if (this.env.notShowBookmarkTutorial === false) {
        this.env.notShowBookmarkTutorial = true;
        this.env.storageSet("not-show-bookmark-tutorial", 'yes');
        await this.showBookmarkTutorial();
      }
    }
    this.firstLoadItems();
  }

  async addBookmark(record: ScanRecord, slidingItem: IonItemSliding) {
    slidingItem.close();
    if (this.env.bookmarks.find(x => x.text === record.text)) {
      await this.presentToast(this.translate.instant("MSG.ALREADY_BOOKMARKED"), "short", "bottom");
      return;
    }
    await this.showBookmarkAlert(record);
  }

  async showBookmarkAlert(record: ScanRecord) {
    const alert = await this.alertController.create(
      {
        header: this.translate.instant('BOOKMARK'),
        message: this.translate.instant('MSG.INPUT_TAG'),
        cssClass: ['alert-bg'],
        inputs: [
          {
            name: 'tag',
            id: 'tag',
            type: 'text',
            label: `${this.translate.instant("TAG_MAX_LENGTH")}`,
            placeholder: `${this.translate.instant("TAG_MAX_LENGTH")}`,
            max: 30
          }
        ],
        buttons: [
          {
            text: this.translate.instant('CREATE'),
            handler: async data => {
              alert.dismiss();
              if (data.tag != null && data.tag.trim().length > 30) {
                this.presentToast(this.translate.instant("MSG.TAG_MAX_LENGTH_EXPLAIN"), "short", "bottom");
                return true;
              }
              const bookmark = await this.env.saveBookmark(record.text, data.tag);
              this.bookmarks.unshift(bookmark);
              this.bookmarks.sort((a, b) => {
                return ('' + a.tag ?? '').localeCompare(b.tag ?? '');
              });
              if (bookmark != null) {
                await this.presentToast(this.translate.instant("MSG.BOOKMARKED"), "short", "bottom");
              } else {
                await this.presentToast(this.translate.instant("MSG.ALREADY_BOOKMARKED"), "short", "bottom");
              }
            }
          }
        ]
      }
    )
    await alert.present();
  }

  async removeBookmark(bookmark: Bookmark, slidingItem: IonItemSliding) {
    slidingItem.close();
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteBookmark(bookmark.text);
    const index = this.bookmarks.findIndex(x => x.text === bookmark.text);
    if (index != -1) {
      this.bookmarks.splice(index, 1);
    }
    this.deleteToast = await this.toastController.create({
      message: this.translate.instant('MSG.UNDO_DELETE'),
      duration: 2000,
      color: "light",
      position: "top",
      buttons: [
        {
          text: this.translate.instant('UNDO'),
          side: 'end',
          handler: async () => {
            await this.env.undoBookmarkDeletion(bookmark);
            this.bookmarks.splice(index, 0, bookmark);
            this.deleteToast.dismiss();
          }
        }
      ]
    });
    await this.deleteToast.present();
  }

  async editBookmark(bookmark: Bookmark, slidingItem: IonItemSliding) {
    slidingItem.close();
    await this.showEditBookmarkAlert(bookmark);
  }

  async showEditBookmarkAlert(bookmark: Bookmark) {
    const alert = await this.alertController.create(
      {
        header: this.translate.instant('BOOKMARK'),
        message: this.translate.instant('MSG.INPUT_TAG'),
        cssClass: ['alert-bg'],
        inputs: [
          {
            name: 'tag',
            id: 'tag',
            type: 'text',
            label: `${this.translate.instant("TAG_MAX_LENGTH")}`,
            placeholder: `${this.translate.instant("TAG_MAX_LENGTH")}`,
            value: bookmark.tag ?? '',
            max: 30
          }
        ],
        buttons: [
          {
            text: this.translate.instant('EDIT'),
            handler: async data => {
              alert.dismiss();
              if (data.tag != null && data.tag.trim().length > 30) {
                this.presentToast(this.translate.instant("MSG.TAG_MAX_LENGTH_EXPLAIN"), "short", "bottom");
                return true;
              }
              this.isLoadingText = true;
              await this.env.deleteBookmark(bookmark.text);
              const index = this.bookmarks.findIndex(x => x.text === bookmark.text);
              if (index != -1) {
                this.bookmarks.splice(index, 1);
              }
              const newBookmark = await this.env.saveBookmark(bookmark.text, data.tag);
              this.bookmarks.unshift(newBookmark);
              this.bookmarks.sort((a, b) => {
                return ('' + a.tag ?? '').localeCompare(b.tag ?? '');
              });
              this.isLoadingText = false;
            }
          }
        ]
      }
    )
    await alert.present();
  }

  async removeRecord(record: ScanRecord, slidingItem: IonItemSliding) {
    slidingItem.close();
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteScanRecord(record.id);
    const index = this.scanRecords.findIndex(x => x.id === record.id);
    if (index != -1) {
      this.scanRecords.splice(index, 1);
    }
    this.deleteToast = await this.toastController.create({
      message: this.translate.instant('MSG.UNDO_DELETE'),
      duration: 2000,
      color: "light",
      position: "top",
      buttons: [
        {
          text: this.translate.instant('UNDO'),
          side: 'end',
          handler: async () => {
            await this.env.undoScanRecordDeletion(record);
            this.scanRecords.splice(index, 0, record);
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
              this.scanRecords.length = 0;
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
              this.bookmarks.length = 0;
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
      message: msg
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
