import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Device, DeviceInfo } from '@capacitor/device';
import { ThemeDetection, ThemeDetectionResponse } from '@awesome-cordova-plugins/theme-detection/ngx';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { Bookmark } from '../models/bookmark';
import { ScanRecord } from '../models/scan-record';
import { Toast } from '@capacitor/toast';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  public appVersionNumber: string = '1.0.0';

  public startPage: "/tabs/scan" | "/tabs/generate" | "/tabs/import-image" | "/tabs/history" | "/tabs/setting" = "/tabs/scan";
  public startPageHeader: 'on' | 'off' = 'on';
  public languages: string[] = ['en', 'zh-HK', 'zh-CN'];
  public language: 'en' | 'zh-HK' | 'zh-CN' = 'en';
  public selectedLanguage: 'default' | 'en' | 'zh-HK' | 'zh-CN' = 'default';
  public colorTheme: 'light' | 'dark' | 'black' = 'light';
  public selectedColorTheme: 'default' | 'light' | 'dark' | 'black' = 'default';
  public scanRecordLogging: 'on' | 'off' = 'on';
  public autoMaxBrightness: 'on' | 'off' = 'on';
  public errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M';
  public vibration: 'on' | 'on-haptic' | 'on-scanned' | 'off' = 'on';
  public orientation: 'default' | 'portrait' | 'landscape' = 'default';
  public notShowHistoryTutorial: boolean = false;
  public notShowBookmarkTutorial: boolean = false;
  public notShowUpdateNotes: boolean = false;
  public searchEngine: 'google' | 'bing' | 'yahoo' | 'duckduckgo' | 'yandex' = 'google';
  public debugMode: 'on' | 'off' = 'off';

  public readonly APP_FOLDER_NAME: string = 'SimpleQR';
  public readonly GOOGLE_SEARCH_URL: string = "https://www.google.com/search?q=";
  public readonly BING_SEARCH_URL: string = "https://www.bing.com/search?q=";
  public readonly YAHOO_SEARCH_URL: string = "https://search.yahoo.com/search?p=";
  public readonly DUCK_DUCK_GO_SEARCH_URL: string = "https://duckduckgo.com/?q=";
  public readonly YANDEX_SEARCH_URL: string = "https://yandex.com/search/?text=";
  public readonly GITHUB_REPO_URL: string = "https://github.com/tomfong/simple-qr";
  public readonly GOOGLE_PLAY_URL: string = "https://play.google.com/store/apps/details?id=com.tomfong.simpleqr";
  public readonly APP_STORE_URL: string = "https://apps.apple.com/us/app/simple-qr-by-tom-fong/id1621121553";
  public readonly PRIVACY_POLICY: string = "https://www.privacypolicies.com/live/771b1123-99bb-4bfe-815e-1046c0437a0f";
  public readonly AN_PREV_PATCH_NOTE_STORAGE_KEY = "not-show-update-notes-v20400";
  public readonly IOS_PREV_PATCH_NOTE_STORAGE_KEY = "not-show-update-notes-v20400";
  public readonly AN_PATCH_NOTE_STORAGE_KEY = "not-show-update-notes-v20500";
  public readonly IOS_PATCH_NOTE_STORAGE_KEY = "not-show-update-notes-v20500";

  private _storage: Storage | null = null;
  private _scannedData: string = '';
  private _scannedDataFormat: string = '';
  private _scanRecords: ScanRecord[] = [];
  private _bookmarks: Bookmark[] = [];
  viewingScanRecords: ScanRecord[] = [];
  viewingBookmarks: Bookmark[] = [];
  private _deviceInfo: DeviceInfo | undefined = undefined;

  recordSource: 'create' | 'view' | 'scan';
  viewResultFrom: '/tabs/scan' | '/tabs/import-image' | '/tabs/generate' | '/tabs/history';

  public firstAppLoad: boolean = true;  // once loaded, turn it false

  constructor(
    private platform: Platform,
    private storage: Storage,
    public translate: TranslateService,
    private overlayContainer: OverlayContainer,
    private themeDetection: ThemeDetection,
    private appVersion: AppVersion,
    private screenOrientation: ScreenOrientation
  ) {
    this.platform.ready().then(
      async _ => {
        await this.prioritizedInit();
        this.init();
      }
    )
  }

  private async prioritizedInit() {
    this._storage = await this.storage.create();
    await this._storage.get("start-page").then(
      value => {
        if (value != null) {
          this.startPage = value;
        } else {
          this.startPage = '/tabs/scan';
        }
      }
    );
    await this._storage.get("start-page-header").then(
      async value => {
        if (value !== null && value !== undefined) {
          this.startPageHeader = value;
        } else {
          this.startPageHeader = 'on';
        }
      }
    );
    await this._storage.get(environment.storageScanRecordKey).then(
      value => {
        if (value !== null && value !== undefined) {
          try {
            this._scanRecords = JSON.parse(value);
            this._scanRecords.forEach(
              r => {
                const tCreatedAt = r.createdAt;
                r.createdAt = new Date(tCreatedAt);
              }
            );
            this._scanRecords.sort((r1, r2) => {
              return r2.createdAt.getTime() - r1.createdAt.getTime();
            });
          } catch (err) {
            console.error(err);
            this._scanRecords = [];
          }
        }
      }
    );
    await this._storage.get(environment.storageBookmarkKey).then(
      value => {
        if (value !== null && value !== undefined) {
          try {
            this._bookmarks = JSON.parse(value);
            this._bookmarks.forEach(
              b => {
                if (b.id == null) {
                  b.id = uuidv4();
                }
                const tCreatedAt = b.createdAt;
                b.createdAt = new Date(tCreatedAt);
              }
            );
            this._bookmarks.sort((a, b) => {
              return ('' + a.tag ?? '').localeCompare(b.tag ?? '');
            });
          } catch (err) {
            console.error(err);
            this._bookmarks = [];
          }
        }
      }
    )
    await this._storage.get("debug-mode-on").then(
      value => {
        if (value != null) {
          this.debugMode = value;
        } else {
          this.debugMode = 'off';
        }
      }
    );
  }

  private async init() {
    await Device.getInfo().then(
      value => {
        this._deviceInfo = value;
      }
    )
    this.storageGet("language").then(
      async value => {
        if (value !== null && value !== undefined) {
          this.selectedLanguage = value;
        } else {
          this.selectedLanguage = 'default';
        }
        this.toggleLanguageChange();
      }
    );
    this.storageGet("color").then(
      async value => {
        if (value !== null && value !== undefined) {
          this.selectedColorTheme = value;
        } else {
          this.selectedColorTheme = 'default';
        }
        await this.toggleColorTheme();
      }
    );
    this.storageGet("orientation").then(
      async value => {
        if (value !== null && value !== undefined) {
          this.orientation = value;
        } else {
          this.orientation = 'default';
        }
        await this.toggleOrientationChange();
      }
    );
    this.storageGet("scan-record-logging").then(
      value => {
        if (value !== null && value !== undefined) {
          this.scanRecordLogging = value;
        } else {
          this.scanRecordLogging = 'on';
        }
      }
    );
    this.storageGet("vibration").then(
      value => {
        if (value !== null && value !== undefined) {
          this.vibration = value;
        } else {
          this.vibration = 'on';
        }
      }
    );
    this.storageGet("error-correction-level").then(
      value => {
        if (value !== null && value !== undefined) {
          this.errorCorrectionLevel = value;
        } else {
          this.errorCorrectionLevel = 'M';
        }
      }
    );
    this.storageGet("auto-max-brightness").then(
      value => {
        if (value !== null && value !== undefined) {
          this.autoMaxBrightness = value;
        } else {
          this.autoMaxBrightness = 'on';
        }
      }
    );
    this.storageGet("not-show-history-tutorial").then(
      value => {
        if (value !== null && value !== undefined) {
          this.notShowHistoryTutorial = (value === 'yes' ? true : false);
        } else {
          this.notShowHistoryTutorial = false;
        }
      }
    );
    this.storageGet("not-show-bookmark-tutorial").then(
      value => {
        if (value !== null && value !== undefined) {
          this.notShowBookmarkTutorial = (value === 'yes' ? true : false);
        } else {
          this.notShowBookmarkTutorial = false;
        }
      }
    );
    this.storageGet("search-engine").then(
      value => {
        if (value !== null && value !== undefined) {
          this.searchEngine = value;
        } else {
          this.searchEngine = 'google';
        }
      }
    );
    if (this.platform.is('android')) this._storage.remove(this.AN_PREV_PATCH_NOTE_STORAGE_KEY).catch(err => { });
    if (this.platform.is('ios')) this._storage.remove(this.IOS_PREV_PATCH_NOTE_STORAGE_KEY).catch(err => { });
    this.appVersion.getVersionNumber().then(
      value => {
        this.appVersionNumber = value
      }
    )
  }

  public async storageSet(key: string, value: any) {
    await this._storage?.set(key, value);
  }

  public async storageGet(key: string): Promise<any> {
    const value = await this._storage?.get(key).then(
      value => {
        return value;
      },
      err => {
        if (this.isDebugging) {
          this.presentToast("Error when get item from storage: " + JSON.stringify(err), "long", "top");
        }
        return null;
      }
    );
    return value;
  }

  public async resetAll() {
    await this._storage.clear();
    this.startPage = '/tabs/scan';
    this.startPageHeader = 'on';
    this.selectedLanguage = 'default';
    this.toggleLanguageChange();
    this.selectedColorTheme = 'default';
    await this.toggleColorTheme();
    this.scanRecordLogging = 'on';
    this.autoMaxBrightness = 'on';
    this.errorCorrectionLevel = 'M';
    this.vibration = 'on';
    this.orientation = 'default';
    await this.toggleOrientationChange();
    this.notShowHistoryTutorial = false;
    this.notShowBookmarkTutorial = false;
    this.notShowUpdateNotes = false;
    this.searchEngine = 'google';
    this._scanRecords = [];
    this._bookmarks = [];
    this.debugMode = 'off';
  }

  public async resetData() {
    await this.deleteAllScanRecords();
    await this.deleteAllBookmarks();
  }

  public async resetSetting() {
    this.startPage = '/tabs/scan';
    await this.storageSet("start-page", this.startPage);

    this.startPageHeader = 'on';
    await this.storageSet("start-page-header", this.startPage);

    this.selectedLanguage = 'default';
    this.toggleLanguageChange();
    await this.storageSet("language", this.selectedLanguage);

    this.selectedColorTheme = 'default';
    await this.toggleColorTheme();
    await this.storageSet("color", this.selectedColorTheme);

    this.scanRecordLogging = 'on';
    await this.storageSet("scan-record-logging", this.scanRecordLogging);

    this.autoMaxBrightness = 'on';
    await this.storageSet("auto-max-brightness", this.autoMaxBrightness);

    this.errorCorrectionLevel = 'M';
    await this.storageSet("error-correction-level", this.errorCorrectionLevel);

    this.vibration = 'on';
    await this.storageSet("vibration", this.vibration);

    this.orientation = 'default';
    await this.toggleOrientationChange();
    await this.storageSet("orientation", this.orientation);

    this.notShowHistoryTutorial = false;
    await this.storageSet("not-show-history-tutorial", 'no');

    this.notShowBookmarkTutorial = false;
    await this.storageSet("not-show-bookmark-tutorial", 'no');

    this.notShowUpdateNotes = false;
    if (this.platform.is('ios')) {
      await this.storageSet(this.IOS_PATCH_NOTE_STORAGE_KEY, 'no');
    } else if (this.platform.is('android')) {
      await this.storageSet(this.AN_PATCH_NOTE_STORAGE_KEY, 'no');
    }

    this.searchEngine = 'google';
    await this.storageSet("search-engine", this.searchEngine);

    this.debugMode = 'off';
    await this.storageSet("debug-mode-on", this.debugMode);
  }

  get result(): string {
    return this._scannedData;
  }

  set result(value: string) {
    this._scannedData = value;
  }

  get resultFormat(): string {
    return this._scannedDataFormat;
  }

  set resultFormat(value: string) {
    this._scannedDataFormat = value;
  }

  get scanRecords(): ScanRecord[] {
    return this._scanRecords;
  }

  async saveScanRecord(value: string): Promise<void> {
    const record = new ScanRecord();
    const date = new Date();
    record.id = String(date.getTime());
    record.text = value;
    record.createdAt = date;
    if (this.recordSource != null) {
      record.source = this.recordSource;
      if (this.recordSource == 'scan') {
        record.barcodeType = this._scannedDataFormat;
      }
    }
    this._scanRecords.unshift(record);
    await this.storageSet(environment.storageScanRecordKey, JSON.stringify(this._scanRecords));
  }

  async saveRestoredScanRecords(records: ScanRecord[]): Promise<void> {
    records.forEach(
      r => {
        this._scanRecords.unshift(r);
      }
    );
    this._scanRecords.forEach(
      t => {
        const tCreatedAt = t.createdAt;
        t.createdAt = new Date(tCreatedAt);
      }
    );
    this._scanRecords.sort((r1, r2) => {
      return r2.createdAt.getTime() - r1.createdAt.getTime();
    });
    await this.storageSet(environment.storageScanRecordKey, JSON.stringify(this._scanRecords));
  }

  async saveRestoredBookmarks(bookmarks: Bookmark[]): Promise<void> {
    bookmarks.forEach(
      b => {
        this._bookmarks.unshift(b);
      }
    );
    this._bookmarks.forEach(
      b => {
        if (b.id == null) {
          b.id = uuidv4();
        }
        const tCreatedAt = b.createdAt;
        b.createdAt = new Date(tCreatedAt);
      }
    );
    this._bookmarks.sort((a, b) => {
      return ('' + a.tag ?? '').localeCompare(b.tag ?? '');
    });
    await this.storageSet(environment.storageBookmarkKey, JSON.stringify(this._bookmarks));
  }

  async undoScanRecordDeletion(record: ScanRecord): Promise<void> {
    this._scanRecords.push(record);
    this._scanRecords.sort((r1, r2) => {
      return r2.createdAt.getTime() - r1.createdAt.getTime();
    });
    await this.storageSet(environment.storageScanRecordKey, JSON.stringify(this._scanRecords));
  }

  async deleteScanRecord(recordId: string): Promise<void> {
    const index = this._scanRecords.findIndex(r => r.id === recordId);
    if (index !== -1) {
      this._scanRecords.splice(index, 1);
      await this.storageSet(environment.storageScanRecordKey, JSON.stringify(this._scanRecords));
    }
  }

  async deleteAllScanRecords(): Promise<void> {
    this._scanRecords = [];
    await this.storageSet(environment.storageScanRecordKey, JSON.stringify(this._scanRecords));
  }

  get bookmarks(): Bookmark[] {
    return this._bookmarks;
  }

  async saveBookmark(value: string, tag: string): Promise<Bookmark> {
    const index = this._bookmarks.findIndex(x => x.text === value);
    if (index === -1) {
      const bookmark = new Bookmark();
      const date = new Date();
      bookmark.id = uuidv4();
      bookmark.text = value;
      bookmark.createdAt = date;
      bookmark.tag = tag;
      this._bookmarks.unshift(bookmark);
      this._bookmarks.sort((a, b) => {
        return ('' + a.tag ?? '').localeCompare(b.tag ?? '');
      });
      await this.storageSet(environment.storageBookmarkKey, JSON.stringify(this._bookmarks));
      return bookmark;
    } else {
      return null;
    }
  }

  async undoBookmarkDeletion(bookmark: Bookmark): Promise<void> {
    this._bookmarks.push(bookmark);
    this._bookmarks.sort((a, b) => {
      return ('' + a.tag ?? '').localeCompare(b.tag ?? '');
    });
    await this.storageSet(environment.storageBookmarkKey, JSON.stringify(this._bookmarks));
  }

  async deleteBookmark(text: string): Promise<void> {
    const index = this._bookmarks.findIndex(t => t.text === text);
    if (index !== -1) {
      this._bookmarks.splice(index, 1);
      await this.storageSet(environment.storageBookmarkKey, JSON.stringify(this._bookmarks));
    }
  }

  async deleteAllBookmarks(): Promise<void> {
    this._bookmarks = [];
    await this.storageSet(environment.storageBookmarkKey, JSON.stringify(this._bookmarks));
  }

  toggleLanguageChange() {
    if (this.selectedLanguage === 'default') {
      let language = 'en';
      const browserLang = this.translate.getBrowserCultureLang();
      console.log("browserLang", browserLang);
      if (browserLang.includes("zh", 0)) {
        if (browserLang === 'zh-CN' || browserLang === 'zh-SG') language = 'zh-CN';
        else language = "zh-HK";
      } else if (browserLang.includes("yue", 0)) {
        language = "zh-HK";
      } else if (this.languages.includes(browserLang)) {
        language = browserLang as 'en' | 'zh-HK' | 'zh-CN';
      } else {
        language = 'en';
      }
      this.translate.use(language);
      this.language = language as 'en' | 'zh-HK' | 'zh-CN';
    } else {
      this.translate.use(this.selectedLanguage);
      this.language = this.selectedLanguage;
    }
  }

  async toggleColorTheme(): Promise<void> {
    console.log("toggle color!")
    if (this.selectedColorTheme === 'default') {
      const version = Number(this._deviceInfo?.osVersion.split(".")[0] ?? 0);
      if (this.platform.is("android") && version <= 9) {  // Android 9 or below
        this.colorTheme = 'light';
        document.body.classList.toggle('dark', false);
        document.body.classList.toggle('black', false);
        this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
        this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
        this.overlayContainer.getContainerElement().classList.add('ng-mat-light');
      } else {
        await this.themeDetection.isAvailable().then( // Android 10 or above, iOS
          async (res: ThemeDetectionResponse) => {
            if (res.value) {
              await this.themeDetection.isDarkModeEnabled().then((res: ThemeDetectionResponse) => {
                if (res.value) {
                  this.colorTheme = 'dark';
                  document.body.classList.toggle('dark', true);
                  document.body.classList.toggle('black', false);
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-light');
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
                  this.overlayContainer.getContainerElement().classList.add('ng-mat-dark');
                } else {
                  this.colorTheme = 'light';
                  document.body.classList.toggle('dark', false);
                  document.body.classList.toggle('black', false);
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
                  this.overlayContainer.getContainerElement().classList.add('ng-mat-light');
                }
              }).catch((error: any) => console.error(error));
            } else {
              this.colorTheme = 'light';
              document.body.classList.toggle('dark', false);
              document.body.classList.toggle('black', false);
              this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
              this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
              this.overlayContainer.getContainerElement().classList.add('ng-mat-light');
            }
          }
        )
      }
    } else if (this.selectedColorTheme === 'light') {
      this.colorTheme = 'light';
      document.body.classList.toggle('dark', false);
      document.body.classList.toggle('black', false);
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
      this.overlayContainer.getContainerElement().classList.add('ng-mat-light');
    } else if (this.selectedColorTheme === 'dark') {
      this.colorTheme = 'dark';
      document.body.classList.toggle('dark', true);
      document.body.classList.toggle('black', false);
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-light');
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
      this.overlayContainer.getContainerElement().classList.add('ng-mat-dark');
    } else if (this.selectedColorTheme === 'black') {
      this.colorTheme = 'black';
      document.body.classList.toggle('black', true);
      document.body.classList.toggle('dark', false);
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-light');
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
      this.overlayContainer.getContainerElement().classList.add('ng-mat-black');
    }
  }

  async toggleOrientationChange(): Promise<void> {
    switch (this.orientation) {
      case 'default':
        this.screenOrientation.unlock();
        return;
      case 'portrait':
        // this.screenOrientation.unlock();
        await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
          .catch(err => {
            if (this.isDebugging) {
              this.presentToast("Error when ScreenOrientation.lock(p): " + JSON.stringify(err), "long", "top");
            }
          });
        return;
      case 'landscape':
        // this.screenOrientation.unlock();
        await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE)
          .catch(err => {
            if (this.isDebugging) {
              this.presentToast("Error when ScreenOrientation.lock(l): " + JSON.stringify(err), "long", "top");
            }
          });
        return;
      default:
        this.screenOrientation.unlock();
    }
  }

  getBugReportMailContent(): string {
    const toEmail = "tomfong.dev@gmail.com";
    const now = moment();
    const datetimestr1 = now.format("YYYYMMDDHHmmss");
    const datetimestr2 = now.format("YYYY-MM-DD HH:mm:ss ZZ");
    const appVersion = this.appVersionNumber;
    const model = `${this._deviceInfo?.manufacturer} ${this._deviceInfo?.model}`;
    const os = this.platform.is("android") ? "Android" : (this.platform.is("ios") ? "iOS" : "Other");
    const osVersion = this._deviceInfo?.osVersion;
    const mailContent =
      `
        mailto:${toEmail}?subject=Simple%20QR%20-%20Report%20Issue%20(%23${datetimestr1})&body=Date%20%26%20Time%0A${datetimestr2}%0A%0AApp%20Version%0A${appVersion}%0A%0AModel%0A${model}%0A%0APlatform%0A${os}%20${osVersion}%0A%0ADescription%0D%0A(describe%20the%20issue%20below)%0D%0A%0D%0A
      `;
    return mailContent;
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  get isDebugging(): boolean {
    return this.debugMode === 'on';
  }

  get buildEnv(): string {
    return environment.production ? '' : '.Dev';
  }
}
