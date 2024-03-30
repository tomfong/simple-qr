import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonItemSliding, LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { EnvService } from 'src/app/services/env.service';
import { format, Locale } from 'date-fns';
import { de, enUS, fr, it, ptBR, ru, zhCN, zhHK } from 'date-fns/locale';
import { ScanRecord } from 'src/app/models/scan-record';
import { TranslateService } from '@ngx-translate/core';
import { Bookmark } from 'src/app/models/bookmark';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { fastFadeIn, flyOut } from 'src/app/utils/animations';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  animations: [fastFadeIn, flyOut]
})
export class HistoryPage {

  segmentModel: 'history' | 'bookmarks' = "history";

  deleteToast: HTMLIonToastElement;

  dummyArr = Array.from(Array(10).keys());

  isLoading: boolean = false;

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    public env: EnvService,
    public toastController: ToastController,
    public translate: TranslateService,
    public modalController: ModalController,
    public popoverController: PopoverController,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.route.params.subscribe(val => {
      setTimeout(() => this.firstLoadItems(), 200);
    });
  }

  firstLoadItems() {
    this.isLoading = true;
    if (this.env.recordsLimit != -1) {
      if (this.env.scanRecords.length > this.env.recordsLimit) {
        this.env.scanRecords = this.env.scanRecords.slice(0, this.env.recordsLimit);
      }
    }
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    const scanRecords = [...this.env.scanRecords];
    this.env.viewingScanRecords = scanRecords.slice(0, 15);
    const bookmarks = [...this.env.bookmarks];
    this.env.viewingBookmarks = bookmarks.slice(0, 15);
    this.isLoading = false;
  }

  loadMoreScanRecords() {
    const scanRecords = [...this.env.scanRecords]
    this.env.viewingScanRecords.push(...scanRecords.slice(this.env.viewingScanRecords.length, this.env.viewingScanRecords.length + 15));
  }

  loadMoreBookmarks() {
    const bookmarks = [...this.env.bookmarks]
    this.env.viewingBookmarks.push(...bookmarks.slice(this.env.viewingBookmarks.length, this.env.viewingBookmarks.length + 15));
  }

  onLoadScanRecords(ev: any) {
    setTimeout(() => {
      ev.target.complete();
      this.loadMoreScanRecords();
      if (this.env.viewingScanRecords.length === this.env.scanRecords.length) {
        ev.target.disabled = true;
      }
    }, 500);
  }

  onLoadBookmarks(ev: any) {
    setTimeout(() => {
      ev.target.complete();
      this.loadMoreBookmarks();
      if (this.env.viewingBookmarks.length === this.env.bookmarks.length) {
        ev.target.disabled = true;
      }
    }, 500);
  }

  ionViewWillEnter() {
    this.isLoading = true;
  }

  async ionViewDidEnter() {
    await SplashScreen.hide()
    this.segmentModel = this.env.historyPageStartSegment;
  }

  ionViewWillLeave() {
    this.changeDetectorRef.detach();
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.reattach();
    if (this.deleteToast) {
      this.deleteToast.dismiss();
      this.deleteToast = undefined;
    }
  }

  scanRecordsTrackByFn(index: number, record: ScanRecord): string {
    return record.id;
  }

  bookmarksTrackByFn(index: number, bookmark: Bookmark): string {
    return bookmark.id;
  }

  maskDatetimeAndSource(date: Date, source: 'create' | 'view' | 'scan' | undefined): string {
    if (!date) {
      return "-";
    }
    let locale: Locale;
    switch (this.env.language) {
      case "de":
        locale = de;
        break;
      case "en":
        locale = enUS;
        break;
      case "fr":
        locale = fr;
        break;
      case "it":
        locale = it;
        break;
      case "pt-BR":
        locale = ptBR;
        break;
      case "ru":
        locale = ru;
        break;
      case "zh-CN":
        locale = zhCN;
        break;
      case "zh-HK":
        locale = zhHK;
        break;
      default:
        locale = enUS;
    }
    switch (source) {
      case 'create':
        return `${this.translate.instant("CREATED")} ${this.translate.instant("AT")} ${format(date, "PP pp", { locale: locale })}`;
      case 'view':
        return `${this.translate.instant("VIEWED")} ${this.translate.instant("AT")} ${format(date, "PP pp", { locale: locale })}`;
      case 'scan':
        return `${this.translate.instant("SCANNED")} ${this.translate.instant("AT")} ${format(date, "PP pp", { locale: locale })}`;
    }
  }

  getBarcodeFormat(barcodeType: string): string {
    switch (barcodeType) {
      case "UPC_A":
        return this.translate.instant("BARCODE_TYPE.UPC").trim() + ` (UPC-A)`;
      case "UPC_E":
        return this.translate.instant("BARCODE_TYPE.UPC").trim() + ` (UPC-E)`;
      case "UPC_EAN_EXTENSION":
        return this.translate.instant("BARCODE_TYPE.UPC").trim() + ` (UPC/EAN Ext.)`;
      case "EAN_8":
        return this.translate.instant("BARCODE_TYPE.EAN").trim() + ` (EAN-8)`;
      case "EAN_13":
        return this.translate.instant("BARCODE_TYPE.EAN").trim() + ` (EAN-13)`;
      case "CODE_39":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 39)`;
      case "CODE_39_MOD_43":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 39 mod 43)`;
      case "CODE_93":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 93)`;
      case "CODE_128":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Code 128)`;
      case "CODABAR":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (Codabar)`;
      case "ITF":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (ITF)`;
      case "ITF_14":
        return this.translate.instant("BARCODE_TYPE.1D").trim() + ` (ITF-14)`;
      case "AZTEC":
        return this.translate.instant("BARCODE_TYPE.AZTEC").trim();
      case "DATA_MATRIX":
        return this.translate.instant("BARCODE_TYPE.DATA_MATRIX").trim();
      case "MAXICODE":
        return this.translate.instant("BARCODE_TYPE.MAXICODE").trim();
      case "PDF_417":
        return this.translate.instant("BARCODE_TYPE.PDF_417").trim();
      case "QR_CODE":
        return this.translate.instant("BARCODE_TYPE.QR_CODE").trim();
      case "RSS_14":
        return this.translate.instant("BARCODE_TYPE.RSS").trim();
      case "RSS_EXPANDED":
        return this.translate.instant("BARCODE_TYPE.RSS").trim();
      default:
        return this.env.resultContentFormat;
    }
  }

  async viewRecord(data: string, source: "view-log" | "view-bookmark"): Promise<void> {
    this.isLoading = true;
    this.changeDetectorRef.detach();
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.reattach();
    const loading = await this.presentLoading(this.translate.instant('PLEASE_WAIT'));
    this.env.resultContent = data;
    this.env.resultContentFormat = "";
    this.env.recordSource = "view";
    this.env.detailedRecordSource = source;
    this.env.viewResultFrom = "/tabs/history";
    this.router.navigate(['tabs/result']).then(
      () => {
        loading.dismiss();
      }
    );
  }

  async segmentChanged(ev: any) {
    this.firstLoadItems();
  }

  async addBookmark(record: ScanRecord, slidingItem: IonItemSliding) {
    await slidingItem.close();
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
            label: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
            placeholder: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
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
              this.env.viewingBookmarks.unshift(bookmark);
              this.env.viewingBookmarks.sort((a, b) => {
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
    slidingItem.disabled = true;
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteBookmark(bookmark.text);
    const index = this.env.viewingBookmarks.findIndex(x => x.text == bookmark.text);
    if (index != -1) {
      this.env.viewingBookmarks.splice(index, 1);
      if (this.env.bookmarks?.length > this.env.viewingBookmarks.length) {
        const bookmarks = [...this.env.bookmarks]
        this.env.viewingBookmarks.push(...bookmarks.slice(this.env.viewingBookmarks.length, this.env.viewingBookmarks.length + 1));
      }
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
            this.env.viewingBookmarks.splice(index, 0, bookmark);
            this.deleteToast.dismiss();
          }
        }
      ]
    });
    await this.deleteToast.present();
  }

  async editBookmark(bookmark: Bookmark, slidingItem: IonItemSliding) {
    await slidingItem.close();
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
            label: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
            placeholder: `${this.translate.instant("MSG.TAG_MAX_LENGTH")}`,
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
              this.isLoading = true;
              await this.env.deleteBookmark(bookmark.text);
              const index = this.env.viewingBookmarks.findIndex(x => x.text === bookmark.text);
              if (index != -1) {
                this.env.viewingBookmarks.splice(index, 1);
              }
              const newBookmark = await this.env.saveBookmark(bookmark.text, data.tag);
              this.env.viewingBookmarks.unshift(newBookmark);
              this.env.viewingBookmarks.sort((a, b) => {
                return ('' + a.tag ?? '').localeCompare(b.tag ?? '');
              });
              this.isLoading = false;
            }
          }
        ]
      }
    )
    await alert.present();
  }

  async removeRecord(record: ScanRecord, slidingItem: IonItemSliding) {
    slidingItem.disabled = true;
    if (this.deleteToast) {
      await this.deleteToast.dismiss();
      this.deleteToast = null;
    }
    await this.env.deleteScanRecord(record.id);
    const index = this.env.viewingScanRecords.findIndex(x => x.id == record.id);
    if (index != -1) {
      this.env.viewingScanRecords.splice(index, 1);
      if (this.env.scanRecords?.length > this.env.viewingScanRecords.length) {
        const scanRecords = [...this.env.scanRecords]
        this.env.viewingScanRecords.push(...scanRecords.slice(this.env.viewingScanRecords.length, this.env.viewingScanRecords.length + 1));
      }
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
            this.env.viewingScanRecords.splice(index, 0, record);
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
              this.isLoading = true;
              this.env.viewingScanRecords = [];
              this.isLoading = false;
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
              this.isLoading = true;
              this.env.viewingBookmarks = [];
              this.isLoading = false;
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
    this.isLoading = true;
    this.changeDetectorRef.detach();
    this.env.viewingScanRecords = [];
    this.env.viewingBookmarks = [];
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.reattach();
    this.router.navigate(['setting-record']);
  }

  get denominator() {
    return this.env.recordsLimit;
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
      await Haptics.impact({ style: ImpactStyle.Light })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }
}
