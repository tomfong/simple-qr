import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { Device, DeviceInfo } from '@capacitor/device';
import { ThemeDetection, ThemeDetectionResponse } from '@awesome-cordova-plugins/theme-detection/ngx';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { environment } from 'src/environments/environment';
import { Bookmark } from '../models/bookmark';
import { ScanRecord } from '../models/scan-record';
import { Toast } from '@capacitor/toast';
import { v4 as uuidv4 } from 'uuid';
import { Preferences } from '@capacitor/preferences';
import { Observable } from 'rxjs';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { StatusBar, Style } from '@capacitor/status-bar';

export declare type LanguageType = 'de' | 'en' | 'fr' | 'it' | 'pt-BR' | 'ru' | 'zh-CN' | 'zh-HK';
export declare type TabPageType = "/tabs/scan" | "/tabs/generate" | "/tabs/history" | "/tabs/setting";
export declare type HistoryPageSegmentType = 'history' | 'bookmarks';
export declare type OnOffType = "on" | "off";
export declare type ColorThemeType = 'light' | 'dark' | 'black';
export declare type ErrorCorrectionLevelType = 'L' | 'M' | 'Q' | 'H';
export declare type VibrationType = "on" | "off" | 'on-haptic' | 'on-scanned';
export declare type OrientationType = 'portrait' | 'landscape';
export declare type SearchEngineType = 'google' | 'bing' | 'yahoo' | 'duckduckgo' | 'yandex' | 'ecosia' | 'brave';
export declare type ResultPageButtonsType = 'detailed' | 'icon-only';
export declare type QrResultContentTypeType = "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi" | "geo";
export declare type QrCreateContentTypeType = "freeText" | "url" | "contact" | "phone" | "sms" | "emailW3C" | "emailDocomo" | "wifi" | "geo";

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  public appVersionNumber: string = '5.0.0';

  public startPage: TabPageType = "/tabs/scan";
  public historyPageStartSegment: HistoryPageSegmentType = 'history';
  public startPageHeader: OnOffType = 'on';
  public languages: LanguageType[] = ['en', 'zh-HK', 'zh-CN', 'de', 'fr', 'it', 'pt-BR', 'ru'];
  public language: LanguageType = 'en';
  public selectedLanguage: 'default' | LanguageType = 'default';
  public colorTheme: ColorThemeType = 'light';
  public selectedColorTheme: 'default' | ColorThemeType = 'default';
  public scanRecordLogging: OnOffType = 'on';
  public recordsLimit: 30 | 50 | 100 | -1 = -1;
  public showNumberOfRecords: OnOffType = 'on';
  public autoMaxBrightness: OnOffType = 'off';
  public autoOpenUrl: OnOffType = 'off';
  public errorCorrectionLevel: ErrorCorrectionLevelType = 'M';
  public qrCodeLightR: number = 255;
  public qrCodeLightG: number = 255;
  public qrCodeLightB: number = 255;
  public qrCodeDarkR: number = 34;
  public qrCodeDarkG: number = 36;
  public qrCodeDarkB: number = 40;
  public qrCodeMargin: number = 3;
  public vibration: VibrationType = 'on';
  public orientation: 'default' | OrientationType = 'default';
  public searchEngine: SearchEngineType = 'google';
  public resultPageButtons: ResultPageButtonsType = 'detailed';
  public showQrAfterCameraScan: OnOffType = 'off';
  public showQrAfterImageScan: OnOffType = 'off';
  public showQrAfterCreate: OnOffType = 'on';
  public showQrAfterLogView: OnOffType = 'on';
  public showQrAfterBookmarkView: OnOffType = 'on';
  public showSearchButton: OnOffType = 'on';
  public showCopyButton: OnOffType = 'on';
  public showBase64Button: OnOffType = 'on';
  public showEnlargeButton: OnOffType = 'on';
  public showBookmarkButton: OnOffType = 'on';
  public showOpenUrlButton: OnOffType = 'on';
  public showBrowseButton: OnOffType = 'on';
  public showAddContactButton: OnOffType = 'on';
  public showCallButton: OnOffType = 'on';
  public showSendMessageButton: OnOffType = 'on';
  public showSendEmailButton: OnOffType = 'on';
  public showOpenFoodFactsButton: OnOffType = 'on';
  public showExitAppAlert: OnOffType = "on";
  public debugMode: OnOffType = 'off';
  public autoExitAppMin: 1 | 3 | 5 | -1 = -1;

  public readonly KEY_START_PAGE = "start-page";
  public readonly KEY_HISTORY_PAGE_START_SEGMENT = "history-page-start-segment";
  public readonly KEY_START_PAGE_HEADER = "start-page-header";
  public readonly KEY_SCAN_RECORDS = "scanRecords";
  public readonly KEY_BOOKMARKS = "bookmarks";
  public readonly KEY_LANGUAGE = "language";
  public readonly KEY_COLOR = "color";
  public readonly KEY_DEBUG_MODE = "debug-mode-on";
  public readonly KEY_SHOW_EXIT_APP_ALERT = "showExitAppAlert";
  public readonly KEY_ORIENTATION = "orientation";
  public readonly KEY_SCAN_RECORD_LOGGING = "scan-record-logging";
  public readonly KEY_RECORDS_LIMIT = "recordsLimit";
  public readonly KEY_SHOW_NUMBER_OF_RECORDS = "showNumberOfRecords";
  public readonly KEY_VIBRATION = "vibration";
  public readonly KEY_ERROR_CORRECTION_LEVEL = "error-correction-level";
  public readonly KEY_QR_CODE_LIGHT_R = "qrCodeLightR";
  public readonly KEY_QR_CODE_LIGHT_G = "qrCodeLightG";
  public readonly KEY_QR_CODE_LIGHT_B = "qrCodeLightB";
  public readonly KEY_QR_CODE_DARK_R = "qrCodeDarkR";
  public readonly KEY_QR_CODE_DARK_G = "qrCodeDarkG";
  public readonly KEY_QR_CODE_DARK_B = "qrCodeDarkB";
  public readonly KEY_QR_CODE_MARGIN = "qrCodeMargin";
  public readonly KEY_AUTO_MAX_BRIGHTNESS = "auto-max-brightness";
  public readonly KEY_AUTO_OPEN_URL = "auto-open-url";
  public readonly KEY_SEARCH_ENGINE = "search-engine";
  public readonly KEY_RESULT_PAGE_BUTTONS = "result-page-buttons";
  public readonly KEY_SHOW_QR_AFTER_CAMERA_SCAN = "show-qr-after-camera-scan";
  public readonly KEY_SHOW_QR_AFTER_IMAGE_SCAN = "show-qr-after-image-scan";
  public readonly KEY_SHOW_QR_AFTER_CREATE = "show-qr-after-create";
  public readonly KEY_SHOW_QR_AFTER_LOG_VIEW = "show-qr-after-log-view";
  public readonly KEY_SHOW_QR_AFTER_BOOKMARK_VIEW = "show-qr-after-bookmark-view";
  public readonly KEY_SHOW_SEARCH_BUTTON = "showSearchButton";
  public readonly KEY_SHOW_COPY_BUTTON = "showCopyButton";
  public readonly KEY_SHOW_BASE64_BUTTON = "showBase64Button";
  public readonly KEY_SHOW_ENLARGE_BUTTON = "showEnlargeButton";
  public readonly KEY_SHOW_BOOKMARK_BUTTON = "showBookmarkButton";
  public readonly KEY_SHOW_OPEN_URL_BUTTON = "showOpenUrlButton";
  public readonly KEY_SHOW_BROWSE_BUTTON = "showBrowseButton";
  public readonly KEY_SHOW_ADD_CONTACT_BUTTON = "showAddContactButton";
  public readonly KEY_SHOW_CALL_BUTTON = "showCallButton";
  public readonly KEY_SHOW_SEND_MESSAGE_BUTTON = "showSendMessageButton";
  public readonly KEY_SHOW_SEND_EMAIL_BUTTON = "showSendEmailButton";
  public readonly KEY_SHOW_OPEN_FOOD_FACTS_BUTTON = "showOpenFoodFactsButton";
  public readonly KEY_AUTO_EXIT_MIN = "autoExitAppMin";

  public readonly APP_FOLDER_NAME: string = 'SimpleQR';

  public readonly GOOGLE_SEARCH_URL: string = "https://www.google.com/search?q=";
  public readonly BING_SEARCH_URL: string = "https://www.bing.com/search?q=";
  public readonly YAHOO_SEARCH_URL: string = "https://search.yahoo.com/search?p=";
  public readonly DUCK_DUCK_GO_SEARCH_URL: string = "https://duckduckgo.com/?q=";
  public readonly YANDEX_SEARCH_URL: string = "https://yandex.com/search/?text=";
  public readonly ECOSIA_SEARCH_URL: string = "https://www.ecosia.org/search?method=index&q=";
  public readonly BRAVE_SEARCH_URL: string = "https://search.brave.com/search?q=";

  public readonly GITHUB_REPO_URL: string = "https://github.com/tomfong/simple-qr";
  public readonly GOOGLE_PLAY_URL: string = "https://play.google.com/store/apps/details?id=com.tomfong.simpleqr";
  public readonly APP_STORE_URL: string = "https://apps.apple.com/us/app/simple-qr-by-tom-fong/id1621121553";
  public readonly GITHUB_RELEASE_URL: string = "https://github.com/tomfong/simple-qr/releases";
  public readonly PRIVACY_POLICY: string = "https://www.privacypolicies.com/live/771b1123-99bb-4bfe-815e-1046c0437a0f";

  resultContent: string = '';
  editingContent: boolean = false;
  resultContentFormat: string = '';
  scanRecords: ScanRecord[] = [];
  bookmarks: Bookmark[] = [];
  viewingScanRecords: ScanRecord[] = [];
  viewingBookmarks: Bookmark[] = [];
  private _deviceInfo: DeviceInfo | undefined = undefined;

  recordSource: 'create' | 'view' | 'scan';
  detailedRecordSource: 'create' | 'view-log' | 'view-bookmark' | 'scan-camera' | 'scan-image';
  viewResultFrom: '/tabs/scan' | '/tabs/generate' | '/tabs/history';

  public firstAppLoad: boolean = true;  // once loaded, turn it false

  initObservable: Observable<boolean>;

  constructor(
    private platform: Platform,
    private ionicStorage: Storage,
    public translate: TranslateService,
    private overlayContainer: OverlayContainer,
    private themeDetection: ThemeDetection,
    private screenOrientation: ScreenOrientation,
  ) {
    this.platform.ready().then(
      async _ => {
        this.initObservable = new Observable<boolean>(subs => {
          new Promise(async _ => {
            await Device.getInfo().then(
              value => {
                this._deviceInfo = value;
              }
            );
            await this._loadStorage();
            console.log(`env.service.ts - constructor - _loadStorage()`)
            subs.next(true);
          });
        });
      }
    )
  }

  private async _loadStorage() {
    const loadPromise1 = Preferences.get({ key: this.KEY_START_PAGE }).then(
      async result => {
        if (result.value != null) {
          this.startPage = result.value == '/tabs/import-image' ? '/tabs/scan' : result.value as TabPageType;
        } else {
          this.startPage = '/tabs/scan';
        }
      }
    );
    const loadPromise2 = Preferences.get({ key: this.KEY_HISTORY_PAGE_START_SEGMENT }).then(
      async result => {
        if (result.value != null) {
          this.historyPageStartSegment = result.value as HistoryPageSegmentType;
        } else {
          this.historyPageStartSegment = 'history';
        }
      }
    );
    const loadPromise3 = Preferences.get({ key: this.KEY_START_PAGE_HEADER }).then(
      async result => {
        if (result.value != null) {
          this.startPageHeader = result.value as OnOffType;
        } else {
          this.startPageHeader = 'on';
        }
      }
    );
    const loadPromise4 = Preferences.get({ key: this.KEY_SCAN_RECORDS }).then(
      async result => {
        if (result.value != null) {
          try {
            this.scanRecords = JSON.parse(result.value);
            this.scanRecords.forEach(
              r => {
                const tCreatedAt = r.createdAt;
                r.createdAt = new Date(tCreatedAt);
              }
            );
            this.scanRecords.sort((r1, r2) => {
              return r2.createdAt.getTime() - r1.createdAt.getTime();
            });
          } catch (err) {
            console.error(err);
            this.scanRecords = [];
          }
        }
      }
    );
    const loadPromise5 = Preferences.get({ key: this.KEY_BOOKMARKS }).then(
      async result => {
        if (result.value != null) {
          try {
            this.bookmarks = JSON.parse(result.value);
            this.bookmarks.forEach(
              b => {
                if (b.id == null) {
                  b.id = uuidv4();
                }
                const tCreatedAt = b.createdAt;
                b.createdAt = new Date(tCreatedAt);
              }
            );
            this.bookmarks.sort((a, b) => {
              return ('' + a.tag).localeCompare(b.tag ?? '');
            });
          } catch (err) {
            console.error(err);
            this.bookmarks = [];
          }
        }
      }
    )
    const loadPromise6 = Preferences.get({ key: this.KEY_LANGUAGE }).then(
      async result => {
        if (result.value != null) {
          this.selectedLanguage = result.value as 'default' | LanguageType;
        } else {
          this.selectedLanguage = 'default';
        }
        this.toggleLanguageChange();
      }
    );
    const loadPromise7 = Preferences.get({ key: this.KEY_COLOR }).then(
      async result => {
        if (result.value != null) {
          this.selectedColorTheme = result.value as 'default' | ColorThemeType;
        } else {
          this.selectedColorTheme = 'default';
        }
        await this.toggleColorTheme();
      }
    );
    const loadPromise8 = Preferences.get({ key: this.KEY_SHOW_EXIT_APP_ALERT }).then(
      async result => {
        if (result.value != null) {
          this.showExitAppAlert = result.value as OnOffType;
        } else {
          this.showExitAppAlert = 'on';
        }
      }
    );
    const loadPromise9 = Preferences.get({ key: this.KEY_DEBUG_MODE }).then(
      async result => {
        if (result.value != null) {
          this.debugMode = result.value as OnOffType;
        } else {
          this.debugMode = 'off';
        }
      }
    );
    const loadPromise10 = Preferences.get({ key: this.KEY_ORIENTATION }).then(
      async result => {
        if (result.value != null) {
          this.orientation = result.value as 'default' | OrientationType;
        } else {
          this.orientation = 'default';
        }
        await this.toggleOrientationChange();
      }
    );
    const loadPromise11 = Preferences.get({ key: this.KEY_SCAN_RECORD_LOGGING }).then(
      async result => {
        if (result.value != null) {
          this.scanRecordLogging = result.value as OnOffType;
        } else {
          this.scanRecordLogging = 'on';
        }
      }
    );
    const loadPromise12 = Preferences.get({ key: this.KEY_RECORDS_LIMIT }).then(
      async result => {
        if (result.value != null) {
          this.recordsLimit = JSON.parse(result.value);
        } else {
          this.recordsLimit = -1;
        }
      }
    );
    const loadPromise13 = Preferences.get({ key: this.KEY_SHOW_NUMBER_OF_RECORDS }).then(
      async result => {
        if (result.value != null) {
          this.showNumberOfRecords = result.value as OnOffType;
        } else {
          this.showNumberOfRecords = 'on';
        }
      }
    );
    const loadPromise14 = Preferences.get({ key: this.KEY_VIBRATION }).then(
      async result => {
        if (result.value != null) {
          this.vibration = result.value as VibrationType;
        } else {
          this.vibration = 'on';
        }
      }
    );
    const loadPromise15 = Preferences.get({ key: this.KEY_ERROR_CORRECTION_LEVEL }).then(
      async result => {
        if (result.value != null) {
          this.errorCorrectionLevel = result.value as ErrorCorrectionLevelType;
        } else {
          this.errorCorrectionLevel = 'M';
        }
      }
    );
    const loadPromise16 = Preferences.get({ key: this.KEY_QR_CODE_LIGHT_R }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeLightR = JSON.parse(result.value);
        } else {
          this.qrCodeLightR = 255;
        }
      }
    );
    const loadPromise17 = Preferences.get({ key: this.KEY_QR_CODE_LIGHT_G }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeLightG = JSON.parse(result.value);
        } else {
          this.qrCodeLightG = 255;
        }
      }
    );
    const loadPromise18 = Preferences.get({ key: this.KEY_QR_CODE_LIGHT_B }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeLightB = JSON.parse(result.value);
        } else {
          this.qrCodeLightB = 255;
        }
      }
    );
    const loadPromise19 = Preferences.get({ key: this.KEY_QR_CODE_DARK_R }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeDarkR = JSON.parse(result.value);
        } else {
          this.qrCodeDarkR = 34;
        }
      }
    );
    const loadPromise20 = Preferences.get({ key: this.KEY_QR_CODE_DARK_G }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeDarkG = JSON.parse(result.value);
        } else {
          this.qrCodeDarkG = 36;
        }
      }
    );
    const loadPromise21 = Preferences.get({ key: this.KEY_QR_CODE_DARK_B }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeDarkB = JSON.parse(result.value);
        } else {
          this.qrCodeDarkB = 40;
        }
      }
    );
    const loadPromise22 = Preferences.get({ key: this.KEY_QR_CODE_MARGIN }).then(
      async result => {
        if (result.value != null) {
          this.qrCodeMargin = JSON.parse(result.value);
        } else {
          this.qrCodeMargin = 3;
        }
      }
    );
    const loadPromise23 = Preferences.get({ key: this.KEY_AUTO_MAX_BRIGHTNESS }).then(
      async result => {
        if (result.value != null) {
          this.autoMaxBrightness = result.value as OnOffType;
        } else {
          this.autoMaxBrightness = 'off';
        }
      }
    );
    const loadPromise24 = Preferences.get({ key: this.KEY_AUTO_OPEN_URL }).then(
      async result => {
        if (result.value != null) {
          this.autoOpenUrl = result.value as OnOffType;
        } else {
          this.autoOpenUrl = 'off';
        }
      }
    );
    const loadPromise25 = Preferences.get({ key: this.KEY_SEARCH_ENGINE }).then(
      async result => {
        if (result.value != null) {
          this.searchEngine = result.value as SearchEngineType;
        } else {
          this.searchEngine = 'google';
        }
      }
    );
    const loadPromise26 = Preferences.get({ key: this.KEY_RESULT_PAGE_BUTTONS }).then(
      async result => {
        if (result.value != null) {
          this.resultPageButtons = result.value as ResultPageButtonsType;
        } else {
          this.resultPageButtons = 'detailed';
        }
      }
    );
    const loadPromise27 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_CAMERA_SCAN }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterCameraScan = result.value as OnOffType;
        } else {
          this.showQrAfterCameraScan = 'off';
        }
      }
    );
    const loadPromise28 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_IMAGE_SCAN }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterImageScan = result.value as OnOffType;
        } else {
          this.showQrAfterImageScan = 'off';
        }
      }
    );
    const loadPromise29 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_CREATE }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterCreate = result.value as OnOffType;
        } else {
          this.showQrAfterCreate = 'on';
        }
      }
    );
    const loadPromise30 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_LOG_VIEW }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterLogView = result.value as OnOffType;
        } else {
          this.showQrAfterLogView = 'on';
        }
      }
    );
    const loadPromise31 = Preferences.get({ key: this.KEY_SHOW_QR_AFTER_BOOKMARK_VIEW }).then(
      async result => {
        if (result.value != null) {
          this.showQrAfterBookmarkView = result.value as OnOffType;
        } else {
          this.showQrAfterBookmarkView = 'on';
        }
      }
    );
    const loadPromise32 = Preferences.get({ key: this.KEY_SHOW_SEARCH_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showSearchButton = result.value as OnOffType;
        } else {
          this.showSearchButton = 'on';
        }
      }
    );
    const loadPromise33 = Preferences.get({ key: this.KEY_SHOW_COPY_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showCopyButton = result.value as OnOffType;
        } else {
          this.showCopyButton = 'on';
        }
      }
    );
    const loadPromise34 = Preferences.get({ key: this.KEY_SHOW_BASE64_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showBase64Button = result.value as OnOffType;
        } else {
          this.showBase64Button = 'on';
        }
      }
    );
    const loadPromise35 = Preferences.get({ key: this.KEY_SHOW_ENLARGE_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showEnlargeButton = result.value as OnOffType;
        } else {
          this.showEnlargeButton = 'on';
        }
      }
    );
    const loadPromise36 = Preferences.get({ key: this.KEY_SHOW_BOOKMARK_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showBookmarkButton = result.value as OnOffType;
        } else {
          this.showBookmarkButton = 'on';
        }
      }
    );
    const loadPromise37 = Preferences.get({ key: this.KEY_SHOW_OPEN_URL_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showOpenUrlButton = result.value as OnOffType;
        } else {
          this.showOpenUrlButton = 'on';
        }
      }
    );
    const loadPromise38 = Preferences.get({ key: this.KEY_SHOW_BROWSE_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showBrowseButton = result.value as OnOffType;
        } else {
          this.showBrowseButton = 'on';
        }
      }
    );
    const loadPromise39 = Preferences.get({ key: this.KEY_SHOW_ADD_CONTACT_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showAddContactButton = result.value as OnOffType;
        } else {
          this.showAddContactButton = 'on';
        }
      }
    );
    const loadPromise40 = Preferences.get({ key: this.KEY_SHOW_CALL_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showCallButton = result.value as OnOffType;
        } else {
          this.showCallButton = 'on';
        }
      }
    );
    const loadPromise41 = Preferences.get({ key: this.KEY_SHOW_SEND_MESSAGE_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showSendMessageButton = result.value as OnOffType;
        } else {
          this.showSendMessageButton = 'on';
        }
      }
    );
    const loadPromise42 = Preferences.get({ key: this.KEY_SHOW_SEND_EMAIL_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showSendEmailButton = result.value as OnOffType;
        } else {
          this.showSendEmailButton = 'on';
        }
      }
    );
    const loadPromise43 = Preferences.get({ key: this.KEY_SHOW_OPEN_FOOD_FACTS_BUTTON }).then(
      async result => {
        if (result.value != null) {
          this.showOpenFoodFactsButton = result.value as OnOffType;
        } else {
          this.showOpenFoodFactsButton = 'on';
        }
      }
    );
    const loadPromise44 = Preferences.get({ key: this.KEY_AUTO_EXIT_MIN }).then(
      async result => {
        if (result.value != null) {
          this.autoExitAppMin = JSON.parse(result.value);
        } else {
          this.autoExitAppMin = -1;
        }
      }
    );
    await Promise.allSettled([
      loadPromise1,
      loadPromise2,
      loadPromise3,
      loadPromise4,
      loadPromise5,
      loadPromise6,
      loadPromise7,
      loadPromise8,
      loadPromise9,
      loadPromise10,
      loadPromise11,
      loadPromise12,
      loadPromise13,
      loadPromise14,
      loadPromise15,
      loadPromise16,
      loadPromise17,
      loadPromise18,
      loadPromise19,
      loadPromise20,
      loadPromise21,
      loadPromise22,
      loadPromise23,
      loadPromise24,
      loadPromise25,
      loadPromise26,
      loadPromise27,
      loadPromise28,
      loadPromise29,
      loadPromise30,
      loadPromise31,
      loadPromise32,
      loadPromise33,
      loadPromise34,
      loadPromise35,
      loadPromise36,
      loadPromise37,
      loadPromise38,
      loadPromise39,
      loadPromise40,
      loadPromise41,
      loadPromise42,
      loadPromise43,
      loadPromise44,
    ]);
  }

  public async resetAll() {
    await Preferences.clear();
    this.startPage = '/tabs/scan';
    this.historyPageStartSegment = 'history';
    this.startPageHeader = 'on';
    this.selectedLanguage = 'default';
    this.toggleLanguageChange();
    this.selectedColorTheme = 'default';
    await this.toggleColorTheme();
    this.scanRecordLogging = 'on';
    this.recordsLimit = -1;
    this.showNumberOfRecords = 'on';
    this.autoMaxBrightness = 'off';
    this.autoOpenUrl = 'off';
    this.errorCorrectionLevel = 'M';
    this.qrCodeLightR = 255;
    this.qrCodeLightG = 255;
    this.qrCodeLightB = 255;
    this.qrCodeDarkR = 34;
    this.qrCodeDarkG = 36;
    this.qrCodeDarkB = 40;
    this.qrCodeMargin = 3;
    this.vibration = 'on';
    this.orientation = 'default';
    await this.toggleOrientationChange();
    this.searchEngine = 'google';
    this.resultPageButtons = 'detailed';
    this.showQrAfterCameraScan = 'off';
    this.showQrAfterImageScan = 'off';
    this.showQrAfterCreate = 'on';
    this.showQrAfterLogView = 'on';
    this.showQrAfterBookmarkView = 'on';
    this.showSearchButton = 'on';
    this.showCopyButton = 'on';
    this.showBase64Button = 'on';
    this.showEnlargeButton = 'on';
    this.showBookmarkButton = 'on';
    this.showOpenUrlButton = 'on';
    this.showBrowseButton = 'on';
    this.showAddContactButton = 'on';
    this.showCallButton = 'on';
    this.showSendMessageButton = 'on';
    this.showSendEmailButton = 'on';
    this.showOpenFoodFactsButton = 'on';
    this.scanRecords = [];
    this.bookmarks = [];
    this.showExitAppAlert = 'on';
    this.debugMode = 'off';
    this.autoExitAppMin = -1;
  }

  public async resetData() {
    await this.deleteAllScanRecords();
    await this.deleteAllBookmarks();
  }

  public async resetSetting() {
    this.startPage = '/tabs/scan';
    await Preferences.set({ key: this.KEY_START_PAGE, value: this.startPage });

    this.historyPageStartSegment = 'history';
    await Preferences.set({ key: this.KEY_HISTORY_PAGE_START_SEGMENT, value: this.historyPageStartSegment });

    this.startPageHeader = 'on';
    await Preferences.set({ key: this.KEY_START_PAGE_HEADER, value: this.startPageHeader });

    this.selectedLanguage = 'default';
    this.toggleLanguageChange();
    await Preferences.set({ key: this.KEY_LANGUAGE, value: this.selectedLanguage });

    this.selectedColorTheme = 'default';
    await this.toggleColorTheme();
    await Preferences.set({ key: this.KEY_COLOR, value: this.selectedColorTheme });

    this.scanRecordLogging = 'on';
    await Preferences.set({ key: this.KEY_SCAN_RECORD_LOGGING, value: this.scanRecordLogging });

    this.recordsLimit = -1;
    await Preferences.set({ key: this.KEY_RECORDS_LIMIT, value: JSON.stringify(this.recordsLimit) });

    this.showNumberOfRecords = 'on';
    await Preferences.set({ key: this.KEY_SHOW_NUMBER_OF_RECORDS, value: this.showNumberOfRecords });

    this.autoMaxBrightness = 'off';
    await Preferences.set({ key: this.KEY_AUTO_MAX_BRIGHTNESS, value: this.autoMaxBrightness });

    this.autoOpenUrl = 'off';
    await Preferences.set({ key: this.KEY_AUTO_OPEN_URL, value: this.autoOpenUrl });

    this.errorCorrectionLevel = 'M';
    await Preferences.set({ key: this.KEY_ERROR_CORRECTION_LEVEL, value: this.errorCorrectionLevel });

    this.qrCodeLightR = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_R, value: JSON.stringify(this.qrCodeLightR) });

    this.qrCodeLightG = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_G, value: JSON.stringify(this.qrCodeLightG) });

    this.qrCodeLightB = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_B, value: JSON.stringify(this.qrCodeLightB) });

    this.qrCodeDarkR = 34;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_R, value: JSON.stringify(this.qrCodeDarkR) });

    this.qrCodeDarkG = 36;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_G, value: JSON.stringify(this.qrCodeDarkG) });

    this.qrCodeDarkB = 40;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_B, value: JSON.stringify(this.qrCodeDarkB) });

    this.qrCodeMargin = 3;
    await Preferences.set({ key: this.KEY_QR_CODE_MARGIN, value: JSON.stringify(this.qrCodeMargin) });
    this.vibration = 'on';
    await Preferences.set({ key: this.KEY_VIBRATION, value: this.vibration });

    this.orientation = 'default';
    await this.toggleOrientationChange();
    await Preferences.set({ key: this.KEY_ORIENTATION, value: this.orientation });

    this.searchEngine = 'google';
    await Preferences.set({ key: this.KEY_SEARCH_ENGINE, value: this.searchEngine });

    this.resultPageButtons = 'detailed';
    await Preferences.set({ key: this.KEY_RESULT_PAGE_BUTTONS, value: this.resultPageButtons });

    this.showQrAfterCameraScan = 'off';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_CAMERA_SCAN, value: this.showQrAfterCameraScan });

    this.showQrAfterImageScan = 'off';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_IMAGE_SCAN, value: this.showQrAfterImageScan });

    this.showQrAfterCreate = 'on';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_CREATE, value: this.showQrAfterCreate });

    this.showQrAfterLogView = 'on';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_LOG_VIEW, value: this.showQrAfterLogView });

    this.showQrAfterBookmarkView = 'on';
    await Preferences.set({ key: this.KEY_SHOW_QR_AFTER_BOOKMARK_VIEW, value: this.showQrAfterBookmarkView });

    this.showSearchButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_SEARCH_BUTTON, value: this.showSearchButton });

    this.showCopyButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_COPY_BUTTON, value: this.showCopyButton });

    this.showBase64Button = 'on';
    await Preferences.set({ key: this.KEY_SHOW_BASE64_BUTTON, value: this.showBase64Button });

    this.showEnlargeButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_ENLARGE_BUTTON, value: this.showEnlargeButton });

    this.showBookmarkButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_BOOKMARK_BUTTON, value: this.showBookmarkButton });

    this.showOpenUrlButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_OPEN_URL_BUTTON, value: this.showOpenUrlButton });

    this.showBrowseButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_BROWSE_BUTTON, value: this.showBrowseButton });

    this.showAddContactButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_ADD_CONTACT_BUTTON, value: this.showAddContactButton });

    this.showCallButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_CALL_BUTTON, value: this.showCallButton });

    this.showSendMessageButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_SEND_MESSAGE_BUTTON, value: this.showSendMessageButton });

    this.showSendEmailButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_SEND_EMAIL_BUTTON, value: this.showSendEmailButton });

    this.showOpenFoodFactsButton = 'on';
    await Preferences.set({ key: this.KEY_SHOW_OPEN_FOOD_FACTS_BUTTON, value: this.showOpenFoodFactsButton });

    this.showExitAppAlert = 'on';
    await Preferences.set({ key: this.KEY_SHOW_EXIT_APP_ALERT, value: this.showExitAppAlert });

    this.debugMode = 'off';
    await Preferences.set({ key: this.KEY_DEBUG_MODE, value: this.debugMode });

    this.autoExitAppMin = -1;
    await Preferences.set({ key: this.KEY_AUTO_EXIT_MIN, value: JSON.stringify(this.autoExitAppMin) });
  }

  async resetQrCodeSettings() {
    this.errorCorrectionLevel = 'M';
    await Preferences.set({ key: this.KEY_ERROR_CORRECTION_LEVEL, value: this.errorCorrectionLevel });

    this.qrCodeLightR = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_R, value: JSON.stringify(this.qrCodeLightR) });

    this.qrCodeLightG = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_G, value: JSON.stringify(this.qrCodeLightG) });

    this.qrCodeLightB = 255;
    await Preferences.set({ key: this.KEY_QR_CODE_LIGHT_B, value: JSON.stringify(this.qrCodeLightB) });

    this.qrCodeDarkR = 34;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_R, value: JSON.stringify(this.qrCodeDarkR) });

    this.qrCodeDarkG = 36;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_G, value: JSON.stringify(this.qrCodeDarkG) });

    this.qrCodeDarkB = 40;
    await Preferences.set({ key: this.KEY_QR_CODE_DARK_B, value: JSON.stringify(this.qrCodeDarkB) });

    this.qrCodeMargin = 3;
    await Preferences.set({ key: this.KEY_QR_CODE_MARGIN, value: JSON.stringify(this.qrCodeMargin) });
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
        record.barcodeType = this.resultContentFormat;
      }
    } else {
      record.source = "view";
    }
    if (this.scanRecords == null) {
      this.scanRecords = [];
    }
    this.scanRecords.unshift(record);
    if (this.recordsLimit != -1) {
      if (this.scanRecords.length > this.recordsLimit) {
        this.scanRecords = this.scanRecords.slice(0, this.recordsLimit);
      }
    }
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async saveRestoredScanRecords(records: ScanRecord[]): Promise<void> {
    records.forEach(
      r => {
        this.scanRecords.unshift(r);
      }
    );
    this.scanRecords.forEach(
      t => {
        const tCreatedAt = t.createdAt;
        t.createdAt = new Date(tCreatedAt);
      }
    );
    this.scanRecords.sort((r1, r2) => {
      return r2.createdAt.getTime() - r1.createdAt.getTime();
    });
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async saveRestoredBookmarks(bookmarks: Bookmark[]): Promise<void> {
    bookmarks.forEach(
      b => {
        this.bookmarks.unshift(b);
      }
    );
    this.bookmarks.forEach(
      b => {
        if (b.id == null) {
          b.id = uuidv4();
        }
        const tCreatedAt = b.createdAt;
        b.createdAt = new Date(tCreatedAt);
      }
    );
    this.bookmarks.sort((a, b) => {
      return ('' + a.tag).localeCompare(b.tag ?? '');
    });
    try {
      const stringified = JSON.stringify(this.bookmarks);
      await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async undoScanRecordDeletion(record: ScanRecord): Promise<void> {
    this.scanRecords.push(record);
    this.scanRecords.sort((r1, r2) => {
      return r2.createdAt.getTime() - r1.createdAt.getTime();
    });
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async deleteScanRecord(recordId: string): Promise<void> {
    const index = this.scanRecords.findIndex(r => r.id === recordId);
    if (index !== -1) {
      this.scanRecords.splice(index, 1);
      try {
        const stringified = JSON.stringify(this.scanRecords);
        await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
      } catch (e) {
        if (this.isDebugging) {
          this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
        }
      }
    }
  }

  async deleteAllScanRecords(): Promise<void> {
    this.scanRecords = [];
    try {
      const stringified = JSON.stringify(this.scanRecords);
      await Preferences.set({ key: this.KEY_SCAN_RECORDS, value: stringified });
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify scanRecords: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async saveBookmark(value: string, tag: string): Promise<Bookmark> {
    const index = this.bookmarks.findIndex(x => x.text === value);
    if (index === -1) {
      const bookmark = new Bookmark();
      const date = new Date();
      bookmark.id = uuidv4();
      bookmark.text = value;
      bookmark.createdAt = date;
      bookmark.tag = tag;
      this.bookmarks.unshift(bookmark);
      this.bookmarks.sort((a, b) => {
        return ('' + a.tag).localeCompare(b.tag ?? '');
      });
      try {
        const stringified = JSON.stringify(this.bookmarks);
        await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
      } catch (e) {
        if (this.isDebugging) {
          this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
        }
      }
      return bookmark;
    } else {
      return null;
    }
  }

  async undoBookmarkDeletion(bookmark: Bookmark): Promise<void> {
    this.bookmarks.push(bookmark);
    this.bookmarks.sort((a, b) => {
      return ('' + a.tag).localeCompare(b.tag ?? '');
    });
    try {
      const stringified = JSON.stringify(this.bookmarks);
      await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  async deleteBookmark(text: string): Promise<void> {
    const index = this.bookmarks.findIndex(t => t.text === text);
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      try {
        const stringified = JSON.stringify(this.bookmarks);
        await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
      } catch (e) {
        if (this.isDebugging) {
          this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
        }
      }
    }
  }

  async deleteAllBookmarks(): Promise<void> {
    this.bookmarks = [];
    try {
      const stringified = JSON.stringify(this.bookmarks);
      await Preferences.set({ key: this.KEY_BOOKMARKS, value: stringified });
    } catch (e) {
      if (this.isDebugging) {
        this.presentToast("Err when stringify bookmarks: " + JSON.stringify(e), "long", "top");
      }
    }
  }

  toggleLanguageChange() {
    if (this.selectedLanguage == 'default') {
      let language = 'en';
      const browserCultureLang = this.translate.getBrowserCultureLang();
      if (browserCultureLang == null) {
        language = 'en';
      } else {
        const lang = browserCultureLang.slice(0, 2)?.toLowerCase();
        switch (lang) {
          case "de":
            language = "de";
            break;
          case "en":
            language = "en"
            break;
          case "fr":
            language = "fr"
            break;
          case "it":
            language = "it"
            break;
          case "pt":
            language = "pt-BR";
            break;
          case "ru":
            language = "ru"
            break;
          case "zh":
            if (browserCultureLang == 'zh-CN' || browserCultureLang == 'zh-SG') {
              language = 'zh-CN';
            } else {
              language = "zh-HK";
            }
            break;
          default:
            if (browserCultureLang.slice(0, 3) == "yue") {
              language = "zh-HK";
            } else {
              language = 'en';
            }
        }
      }
      this.translate.use(language);
      this.language = language as LanguageType;
    } else {
      this.translate.use(this.selectedLanguage);
      this.language = this.selectedLanguage;
    }
  }

  async toggleColorTheme(): Promise<void> {
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
              await this.themeDetection.isDarkModeEnabled().then(async (res: ThemeDetectionResponse) => {
                if (res.value) {
                  this.colorTheme = 'dark';
                  document.body.classList.toggle('dark', true);
                  document.body.classList.toggle('black', false);
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-light');
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
                  this.overlayContainer.getContainerElement().classList.add('ng-mat-dark');
                  if (this.platform.is('android')) {
                    await EdgeToEdge.setBackgroundColor({ color: '#1f1f1f' });
                    await StatusBar.setStyle({ style: Style.Dark });
                  }
                } else {
                  this.colorTheme = 'light';
                  document.body.classList.toggle('dark', false);
                  document.body.classList.toggle('black', false);
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
                  this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
                  this.overlayContainer.getContainerElement().classList.add('ng-mat-light');
                  if (this.platform.is('android')) {
                    await EdgeToEdge.setBackgroundColor({ color: '#000000' });
                    await StatusBar.setStyle({ style: Style.Dark });
                  }
                }
              }).catch((error: any) => console.error(error));
            } else {
              this.colorTheme = 'light';
              document.body.classList.toggle('dark', false);
              document.body.classList.toggle('black', false);
              this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
              this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
              this.overlayContainer.getContainerElement().classList.add('ng-mat-light');
              if (this.platform.is('android')) {
                await EdgeToEdge.setBackgroundColor({ color: '#000000' });
                await StatusBar.setStyle({ style: Style.Dark });
              }
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
      if (this.platform.is('android')) {
        await EdgeToEdge.setBackgroundColor({ color: '#000000' });
        await StatusBar.setStyle({ style: Style.Dark });
      }
    } else if (this.selectedColorTheme === 'dark') {
      this.colorTheme = 'dark';
      document.body.classList.toggle('dark', true);
      document.body.classList.toggle('black', false);
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-light');
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-black');
      this.overlayContainer.getContainerElement().classList.add('ng-mat-dark');
      if (this.platform.is('android')) {
        await EdgeToEdge.setBackgroundColor({ color: '#1f1f1f' });
        await StatusBar.setStyle({ style: Style.Dark });
      }
    } else if (this.selectedColorTheme === 'black') {
      this.colorTheme = 'black';
      document.body.classList.toggle('black', true);
      document.body.classList.toggle('dark', false);
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-light');
      this.overlayContainer.getContainerElement().classList.remove('ng-mat-dark');
      this.overlayContainer.getContainerElement().classList.add('ng-mat-black');
      if (this.platform.is('android')) {
        await EdgeToEdge.setBackgroundColor({ color: '#000000' });
        await StatusBar.setStyle({ style: Style.Dark });
      }
    }
  }

  async toggleOrientationChange(): Promise<void> {
    switch (this.orientation) {
      case 'default':
        this.screenOrientation.unlock();
        return;
      case 'portrait':
        await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
          .catch(err => {
            if (this.isDebugging) {
              this.presentToast("Error when ScreenOrientation.lock(p): " + JSON.stringify(err), "long", "top");
            }
          });
        return;
      case 'landscape':
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
    const now = new Date();
    const datetimestr1 = format(now, "yyyyMMddHHmmss");
    const datetimestr2 = format(now, "yyyy-MM-dd HH:mm:ss zzzz");
    const model = `${this._deviceInfo?.manufacturer} ${this._deviceInfo?.model}`;
    const os = this.platform.is("android") ? "Android" : (this.platform.is("ios") ? "iOS" : "Other");
    const osVersion = this._deviceInfo?.osVersion;
    const mailContent =
      `
        mailto:${toEmail}?subject=Simple%20QR%20-%20Report%20Issue%20(%23${datetimestr1})&body=Date%20%26%20Time%0A${datetimestr2}%0A%0AApp%20Version%0A${this.appVersionNumber}%0A%0AModel%0A${model}%0A%0APlatform%0A${os}%20${osVersion}%0A%0ADescription%0D%0A(describe%20the%20issue%20below)%0D%0A%0D%0A
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
