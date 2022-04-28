import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Device, DeviceInfo } from '@capacitor/device';
import { ThemeDetection, ThemeDetectionResponse } from '@awesome-cordova-plugins/theme-detection/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { Bookmark } from '../models/bookmark';
import { ScanRecord } from '../models/scan-record';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  public appVersionNumber: string = '1.0.0';

  public languages: string[] = ['en', 'zh-HK', 'zh-CN'];
  public language: 'en' | 'zh-HK' | 'zh-CN' = 'en';
  public selectedLanguage: 'default' | 'en' | 'zh-HK' | 'zh-CN' = 'default';
  public colorTheme: 'light' | 'dark' | 'black' = 'light';
  public selectedColorTheme: 'default' | 'light' | 'dark' | 'black' = 'default';
  public scanRecordLogging: 'on' | 'off' = 'on';
  public vibration: 'on' | 'on-haptic' | 'on-scanned' | 'off' = 'on';
  public notShowHistoryTutorial: boolean = false;
  public notShowUpdateNotes: boolean = false;
  public searchEngine: 'google' | 'bing' | 'yahoo' | 'duckduckgo' = 'google';
  public debugModeOn: 'on' | 'off' = 'off';

  public readonly APP_FOLDER_NAME: string = 'SimpleQR';
  public readonly GOOGLE_SEARCH_URL: string = "https://www.google.com/search?q=";
  public readonly BING_SEARCH_URL: string = "https://www.bing.com/search?q=";
  public readonly YAHOO_SEARCH_URL: string = "https://search.yahoo.com/search?p=";
  public readonly DUCK_DUCK_GO_SEARCH_URL: string = "https://duckduckgo.com/?q=";
  public readonly GITHUB_REPO_URL: string = "https://github.com/tomfong/simple-qr";
  public readonly GOOGLE_PLAY_URL: string = "https://play.google.com/store/apps/details?id=com.tomfong.simpleqr";
  public readonly PRIVACY_POLICY: string = "https://www.privacypolicies.com/live/771b1123-99bb-4bfe-815e-1046c0437a0f";
  public readonly PATCH_NOTE_STORAGE_KEY = "not-show-update-notes-v20300";

  private _storage: Storage | null = null;
  private _scannedData: string = '';
  private _scannedDataFormat: string = '';
  private _scanRecords: ScanRecord[] = [];
  private _bookmarks: Bookmark[] = [];
  private _deviceInfo: DeviceInfo | undefined = undefined;

  constructor(
    private platform: Platform,
    private storage: Storage,
    public translate: TranslateService,
    private overlayContainer: OverlayContainer,
    private themeDetection: ThemeDetection,
    private appVersion: AppVersion,
  ) {
    this.platform.ready().then(
      async () => {
        await this.init();
      }
    )
  }

  private async init() {
    this._deviceInfo = await Device.getInfo();
    this.appVersionNumber = await this.appVersion.getVersionNumber();
    const storage = await this.storage.create();
    this._storage = storage;
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
    this.storageGet("not-show-history-tutorial").then(
      value => {
        if (value !== null && value !== undefined) {
          this.notShowHistoryTutorial = (value === 'yes' ? true : false);
        } else {
          this.notShowHistoryTutorial = false;
        }
      }
    );
    this.storageGet(this.PATCH_NOTE_STORAGE_KEY).then(
      value => {
        if (value !== null && value !== undefined) {
          this.notShowUpdateNotes = (value === 'yes' ? true : false);
        } else {
          this.notShowUpdateNotes = false;
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
    this.storageGet(environment.storageScanRecordKey).then(
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
    this.storageGet(environment.storageBookmarkKey).then(
      value => {
        if (value !== null && value !== undefined) {
          try {
            this._bookmarks = JSON.parse(value);
            this._bookmarks.forEach(
              t => {
                const tCreatedAt = t.createdAt;
                t.createdAt = new Date(tCreatedAt);
              }
            );
            this._bookmarks.sort((t1, t2) => {
              return t2.createdAt.getTime() - t1.createdAt.getTime();
            });
          } catch (err) {
            console.error(err);
            this._bookmarks = [];
          }
        }
      }
    )
    this.storageGet("debug-mode-on").then(
      value => {
        if (value != null) {
          this.debugModeOn = value;
        } else {
          this.debugModeOn = 'off';
        }
      }
    );
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
        console.error("error when get from storage", err);
        return null;
      }
    );
    return value;
  }

  public async resetAll() {
    await this._storage.clear();
    this.selectedLanguage = 'default';
    this.toggleLanguageChange();
    this.selectedColorTheme = 'default';
    await this.toggleColorTheme();
    this.scanRecordLogging = 'on';
    this.vibration = 'on';
    this.notShowHistoryTutorial = false;
    this.notShowUpdateNotes = false;
    this.searchEngine = 'google';
    this._scanRecords = [];
    this._bookmarks = [];
    this.debugModeOn = 'off';
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
      t => {
        const tCreatedAt = t.createdAt;
        t.createdAt = new Date(tCreatedAt);
      }
    );
    this._bookmarks.sort((r1, r2) => {
      return r2.createdAt.getTime() - r1.createdAt.getTime();
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

  async saveBookmark(value: string): Promise<boolean> {
    const index = this._bookmarks.findIndex(x => x.text === value);
    if (index === -1) {
      const bookmark = new Bookmark();
      const date = new Date();
      bookmark.text = value;
      bookmark.createdAt = date;
      this._bookmarks.unshift(bookmark);
      await this.storageSet(environment.storageBookmarkKey, JSON.stringify(this._bookmarks));
      return true;
    } else {
      return false;
    }
  }

  async undoBookmarkDeletion(bookmark: Bookmark): Promise<void> {
    this._bookmarks.push(bookmark);
    this._bookmarks.sort((t1, t2) => {
      return t2.createdAt.getTime() - t1.createdAt.getTime();
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

  /** 
      Developer,

      I would like to report an issue regarding Simple QR.

      Date & Time
      {datetimestr2}

      App Version
      {appVersion}

      Model
      {model}

      Platform
      {os} {osVersion}

      Description
      (describe the issue below)

   */
  async getBugReportMailContent(): Promise<string> {
    const toEmail = "tomfong.dev@gmail.com";
    const now = moment();
    const datetimestr1 = now.format("YYYYMMDDHHmmss");
    const datetimestr2 = now.format("YYYY-MM-DD HH:mm:ss ZZ");
    const appVersion = this.appVersionNumber + '.' + this.buildEnv;
    const model = `${this._deviceInfo?.manufacturer} ${this._deviceInfo?.model}`;
    const os = this.platform.is("android") ? "Android" : (this.platform.is("ios") ? "iOS" : "Other");
    const osVersion = this._deviceInfo?.osVersion;
    let mailContent: string;
    switch (this.language) {
      case 'en':
        mailContent = `
          mailto:${toEmail}?subject=Simple%20QR%20-%20Report%20Issue%20(%23${datetimestr1})&body=Developer%2C%0A%0AI%20would%20like%20to%20report%20an%20issue%20regarding%20Simple%20QR.%0A%0ADate%20%26%20Time%0A${datetimestr2}%0A%0AApp%20Version%0A${appVersion}%0A%0AModel%0A${model}%0A%0APlatform%0A${os}%20${osVersion}%0A%0ADescription%0D%0A(describe%20the%20issue%20below)%0D%0A%0D%0A
        ` // must be in a line
        break;
      case 'zh-HK':
        mailContent = `
          mailto:${toEmail}?subject=%E7%B0%A1%E6%98%93QR%20-%20%E5%9B%9E%E5%A0%B1%E5%95%8F%E9%A1%8C%20(%23${datetimestr1})&body=%E9%96%8B%E7%99%BC%E4%BA%BA%E5%93%A1%EF%BC%9A%0A%0A%E6%9C%AC%E4%BA%BA%E6%AC%B2%E5%9B%9E%E5%A0%B1%E6%9C%89%E9%97%9C%E3%80%8C%E7%B0%A1%E6%98%93QR%E3%80%8D%E7%9A%84%E5%95%8F%E9%A1%8C%E3%80%82%0A%0A%E6%97%A5%E6%9C%9F%E5%8F%8A%E6%99%82%E9%96%93%0A${datetimestr2}%0A%0A%E7%A8%8B%E5%BC%8F%E7%89%88%E6%9C%AC%0A${appVersion}%0A%0A%E5%9E%8B%E8%99%9F%0A${model}%0A%0A%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%B5%B1%0A${os}%20${osVersion}%0A%0A%E5%95%8F%E9%A1%8C%E6%8F%8F%E8%BF%B0%0A(%E8%AB%8B%E6%96%BC%E4%B8%8B%E6%96%B9%E6%8F%8F%E8%BF%B0%E5%95%8F%E9%A1%8C)%0D%0A%0D%0A
        ` // must be in a line
        break;
      default:
        mailContent = `
          mailto:${toEmail}?subject=Simple%20QR%20-%20Report%20Issue%20(%23${datetimestr1})&body=Developer%2C%0A%0AI%20would%20like%20to%20report%20an%20issue%20regarding%20Simple%20QR.%0A%0ADate%20%26%20Time%0A${datetimestr2}%0A%0AApp%20Version%0A${appVersion}%0A%0AModel%0A${model}%0A%0APlatform%0A${os}%20${osVersion}%0A%0ADescription%0D%0A(describe%20the%20issue%20below)%0D%0A%0D%0A
        ` // must be in a line
    }
    return mailContent;
  }

  get buildEnv(): string {
    return environment.production ? '' : '.Dev';
  }
}
