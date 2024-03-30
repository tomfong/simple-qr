import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';
import { EncryptService } from 'src/app/services/encrypt.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { format } from 'date-fns';
import { Chooser, ChooserResult } from '@awesome-cordova-plugins/chooser/ngx';
import { ScanRecord } from 'src/app/models/scan-record';
import { Bookmark } from 'src/app/models/bookmark';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { de, enUS, fr, it, ptBR, ru, zhCN, zhHK } from 'date-fns/locale';

@Component({
  selector: 'app-setting-record',
  templateUrl: './setting-record.page.html',
  styleUrls: ['./setting-record.page.scss'],
})
export class SettingRecordPage {

  preventRecordsLimitToast: boolean = true;

  constructor(
    public translate: TranslateService,
    public env: EnvService,
    private encryptService: EncryptService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private chooser: Chooser,
    private socialSharing: SocialSharing,
    private platform: Platform,
    private modalController: ModalController,
  ) { }

  ionViewDidEnter() {
    setTimeout(() => this.preventRecordsLimitToast = false, 100);
  }

  ionViewWillLeave() {
    this.preventRecordsLimitToast = true;
  }

  async saveHistoryPageStartSegment() {
    await Preferences.set({ key: this.env.KEY_HISTORY_PAGE_START_SEGMENT, value: this.env.historyPageStartSegment });
  }

  async onScanRecordLoggingChange(ev: any) {
    this.env.scanRecordLogging = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SCAN_RECORD_LOGGING, value: this.env.scanRecordLogging });
    await this.tapHaptic();
  }

  async saveRecordsLimit() {
    await Preferences.set({ key: this.env.KEY_RECORDS_LIMIT, value: JSON.stringify(this.env.recordsLimit) });
    if (this.env.recordsLimit != -1 && !this.preventRecordsLimitToast) {
      this.presentToast(this.translate.instant("MSG.DELETE_OVERFLOWED_RECORDS"), "short", "bottom");
    }
  }

  async onShowNumberOfRecordsChange(ev: any) {
    this.env.showNumberOfRecords = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_NUMBER_OF_RECORDS, value: this.env.showNumberOfRecords });
    await this.tapHaptic();
  }

  async onBackup() {
    const loading1 = await this.presentLoading(this.translate.instant("ENCRYPTING"));
    const backup = {
      application: "Simple QR",
      scanRecords: this.env.scanRecords,
      bookmarks: this.env.bookmarks
    };
    await this.encryptService.encrypt(JSON.stringify(backup)).then(
      async (value) => {
        loading1.dismiss();
        const loading2 = await this.presentLoading(this.translate.instant("BACKING_UP"));
        const now = format(new Date(), "yyyyMMddHHmmss");
        const filename = this.platform.is('ios') ? `i-simpleqr-backup-${now}.isqbk` : `simpleqr-backup-${now}.tfsqbk`;
        await Filesystem.writeFile({
          path: `${filename}`,
          data: await value.encrypted,
          directory: Directory.External,
          encoding: Encoding.UTF8,
          recursive: true
        }).then(
          async result => {
            loading2.dismiss();
            const msg = this.translate.instant("MSG.BACKUP_SUCCESSFULLY") as string;
            const secret = `${value.secret1},${value.secret2}`;
            const alert = await this.alertController.create(
              {
                header: this.translate.instant('SUCCESS'),
                message: msg.replace("{secret}", secret),
                cssClass: ['alert-bg', 'alert-can-copy'],
                buttons: [
                  {
                    text: this.translate.instant('COPY_SECRET_AND_SAVE_BACKUP'),
                    handler: async () => {
                      await Clipboard.write({ string: secret }).then(
                        async () => {
                          await this.presentToast(this.translate.instant('MSG.COPIED_SECRET'), "short", "bottom");
                        }
                      );
                      const loading3 = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
                      await this.socialSharing.share(null, filename, result.uri, null).then(
                        _ => {
                          loading3.dismiss();
                        }
                      ).catch(
                        err => {
                          loading3.dismiss();
                          if (this.env.isDebugging) {
                            this.presentToast("Error when SocialSharing.share: " + JSON.stringify(err), "long", "top");
                          }
                        }
                      )
                    }
                  }
                ]
              }
            )
            await alert.present();
          }
        ).catch(
          err => {
            loading2.dismiss();
            if (this.env.isDebugging) {
              this.presentToast("Error when call Filesystem.writeFile: " + JSON.stringify(err), "long", "top");
            } else {
              this.presentToast(this.translate.instant("MSG.BACKUP_FAILED_2"), "short", "bottom");
            }
          }
        )
      }
    ).catch(
      err => {
        loading1.dismiss();
        if (this.env.isDebugging) {
          this.presentToast("Error when encrypt: " + JSON.stringify(err), "long", "top");
        } else {
          this.presentToast(this.translate.instant("MSG.BACKUP_FAILED"), "short", "bottom");
        }
      }
    )
  }

  async onRestore() {
    const loading1 = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
    await this.chooser.getFile().then(
      async (value: ChooserResult) => {
        loading1.dismiss();
        if (value == null) {
          return;
        }
        if (this.platform.is('ios')) {
          if (!value.name.toLowerCase().endsWith(".isqbk")) {
            this.presentToast(this.translate.instant("MSG.INVALID_BK_FILE"), "short", "bottom");
            return;
          }
        } else {
          if (!value.name.toLowerCase().endsWith(".tfsqbk")) {
            this.presentToast(this.translate.instant("MSG.INVALID_BK_FILE"), "short", "bottom");
            return;
          }
        }
        const loading2 = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
        await Filesystem.readFile({
          path: value['uri'],
          encoding: Encoding.UTF8
        }).then(
          async value => {
            loading2.dismiss();
            const alert = await this.alertController.create(
              {
                header: this.translate.instant('RESTORE'),
                message: this.translate.instant('MSG.RESTORE_SECRET'),
                cssClass: ['alert-bg'],
                inputs: [
                  {
                    name: 'secret',
                    id: 'secret',
                    type: 'text',
                    label: `${this.translate.instant("SECRET")} (${this.translate.instant("49_DIGIT")})`,
                    placeholder: `${this.translate.instant("SECRET")} (${this.translate.instant("49_DIGIT")})`,
                    max: 49,
                    min: 49,
                  }
                ],
                buttons: [
                  {
                    text: this.translate.instant('RESTORE'),
                    handler: async data => {
                      alert.dismiss();
                      if (data.secret != null && data.secret.trim().length == 49) {
                        if ((typeof value.data) == 'string') {
                          await this.restore(value.data as string, data.secret.trim());
                        } else {
                          this.presentToast(this.translate.instant("MSG.RESTORE_FAILED"), "short", "bottom");
                        }
                      } else {
                        this.presentToast(this.translate.instant("MSG.PLEASE_INPUT_VALID_SECRET"), "short", "bottom");
                      }
                    }
                  }
                ]
              }
            )
            await alert.present();
          }
        ).catch(
          err => {
            loading2.dismiss();
            if (this.env.debugMode === 'on') {
              this.presentToast('Failed to read file', "long", "bottom");
            } else {
              this.presentToast(this.translate.instant("MSG.RESTORE_FAILED"), "short", "bottom");
            }
          }
        )
      }
    ).catch(
      err => {
        loading1.dismiss();
        if (this.env.isDebugging) {
          this.presentToast("Error when call Chooser.getFile: " + JSON.stringify(err), "long", "top");
        } else {
          this.presentToast(this.translate.instant("MSG.RESTORE_FAILED"), "short", "bottom");
        }
      }
    )
  }

  async restore(value: string, secret: string) {
    const secrets = secret.split(",");
    if (secrets.length != 2 || secrets[0].length != 32 || secrets[1].length != 16) {
      this.presentToast(this.translate.instant("MSG.PLEASE_INPUT_VALID_SECRET"), "short", "bottom");
      return;
    }
    const loading = await this.presentLoading(this.translate.instant("DECRYPTING"));
    await this.encryptService.decrypt(value, secrets[0], secrets[1])
      .then(
        async value => {
          loading.dismiss();
          try {
            const restore = JSON.parse(value);
            if (restore.application != "Simple QR") {
              this.presentToast(this.translate.instant("MSG.INVALID_BK_FILE"), "short", "bottom");
              return;
            }
            const tScanRecords = restore.scanRecords as ScanRecord[];
            const scanRecords = tScanRecords.filter(r1 => {
              if (this.env.scanRecords.find(r2 => r1.id === r2.id) == null) {
                return true;
              }
              return false;
            });
            await this.env.saveRestoredScanRecords(scanRecords);
            const tBookmarks = restore.bookmarks as Bookmark[];
            const bookmarks = tBookmarks.filter(b1 => {
              if (this.env.bookmarks.find(b2 => b1.text === b2.text) == null) {
                return true;
              }
              return false;
            });
            await this.env.saveRestoredBookmarks(bookmarks);
            const alert = await this.alertController.create(
              {
                header: this.translate.instant('SUCCESS'),
                message: this.translate.instant('MSG.RESTORE_SUCCESSFUL'),
                cssClass: ['alert-bg'],
                buttons: [
                  {
                    text: this.translate.instant('OK'),
                    handler: async () => {
                      return true;
                    }
                  }
                ]
              }
            )
            await alert.present();
          } catch (err) {
            if (this.env.isDebugging) {
              this.presentToast("Error when encrypt: " + JSON.stringify(err), "long", "top");
            } else {
              this.presentToast(this.translate.instant("MSG.RESTORE_FAILED"), "short", "bottom");
            }
          }
        }
      )
      .catch(err => {
        loading.dismiss();
        if (this.env.isDebugging) {
          this.presentToast("Error when parsing: " + JSON.stringify(err), "long", "top");
        } else {
          this.presentToast(this.translate.instant("MSG.RESTORE_WRONG_SECRET"), "short", "bottom");
        }
      });
  }

  async onExportToCsv() {
    const loading = await this.presentLoading(this.translate.instant("EXPORTING"));
    const now = format(new Date(), "yyyyMMddHHmmss");
    const filename = `simpleqr-${now}.csv`;
    let rawCsvData: string;
    switch (this.env.language) {
      case "de":
        rawCsvData = "ID,Inhalt,Erstellt um,Quelle,Barcode-Typ,Lesezeichen gesetzt?,Etikett\r\n";
        break;
      case "en":
        rawCsvData = "ID,Content,Created at,Source,Barcode Type,Bookmarked?,Tag\r\n";
        break;
      case "fr":
        rawCsvData = "ID,Le contenu,Créé à,La source,Type de code-barres,En signet?,Étiquette\r\n";
        break;
      case "it":
        rawCsvData = "ID,Contenuto,Creato a,Fonte,Tipo di codice a barre,Aggiunto ai preferiti?,Etichetta\r\n";
        break;
      case "pt-BR":
        rawCsvData = "ID,Conteúdo,Criado em,Origem,Tipo de código de barras,Marcado como favorito?,Tag\r\n";
        break;
      case "ru":
        rawCsvData = "ID,Содержание,Создано в,Источник,Тип штрих-кода,В закладках?,Ярлык\r\n";
        break;
      case "zh-CN":
        rawCsvData = "ID,内容,建立于,来源,条码类型,已书签?,标签\r\n";
        break;
      case "zh-HK":
        rawCsvData = "ID,内容,建立於,來源,條碼類型,已書籤?,標籤\r\n";
        break;
      default:
        rawCsvData = "ID,Content,Created at,Source,Barcode Type,Bookmarked?,Tag\r\n";
    }
    this.env.scanRecords.forEach(r => {
      rawCsvData += `"${r.id}","${r.text?.split('"').join('') ?? ""}","${this.maskDatetime(r.createdAt)}","${this.maskSource(r.source)}","${r.barcodeType ?? ''}",`
      const bookmark = this.env.bookmarks.find(b => b.text == r.text);
      if (bookmark != null) {
        rawCsvData += `"TRUE","${bookmark.tag?.split('"').join('') ?? ""}"\r\n`;
      } else {
        rawCsvData += `"FALSE",""\r\n`;
      }
    });
    this.env.bookmarks.forEach(b => {
      if (this.env.scanRecords.findIndex(r => r.text == b.text) == -1) {
        rawCsvData += `"-","${b.text?.split('"').join('') ?? ""}","${this.maskDatetime(b.createdAt)}","-","-","TRUE","${b.tag?.split('"').join('') ?? ""}"\r\n`
      }
    });
    await Filesystem.writeFile({
      path: `${filename}`,
      data: rawCsvData,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      recursive: true
    }).then(
      async result => {
        loading.dismiss();
        const loading2 = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
        await this.socialSharing.share(null, filename, result.uri, null).then(() => {
          loading2.dismiss();
        }).catch(
          err => {
            loading2.dismiss();
            if (this.env.isDebugging) {
              this.presentToast("Error when SocialSharing.share: " + JSON.stringify(err), "long", "top");
            }
          }
        );
      }
    ).catch(
      err => {
        loading.dismiss();
        if (this.env.isDebugging) {
          this.presentToast("Error when call Filesystem.writeFile: " + JSON.stringify(err), "long", "top");
        } else {
          this.presentToast("Error!", "short", "bottom");
        }
      }
    );
  }

  // async onImportFromCsv() {
  //   // TODO: Import from CSV
  //   const loading1 = await this.presentLoading(this.translate.instant("PLEASE_WAIT"));
  //   await this.chooser.getFile().then(
  //     async (value: ChooserResult) => {
  //       if (value == null) {
  //         loading1.dismiss();
  //         return;
  //       }
  //       if (!value.name.toLowerCase().endsWith(".csv")) {
  //         loading1.dismiss();
  //         this.presentToast(`${this.translate.instant("MSG.INVALID_CSV_FILE")} (1)`, "short", "bottom");
  //         return;
  //       }
  //       await Filesystem.readFile({
  //         path: value.uri,
  //         encoding: Encoding.UTF8
  //       }).then(
  //         async value => {
  //           loading1.dismiss();
  //           const loading2 = await this.presentLoading(this.translate.instant("DECODING"));
  //           const data = value.data;
  //           if (data.length == 0) {
  //             loading2.dismiss();
  //             this.presentToast(`${this.translate.instant("MSG.INVALID_CSV_FILE")} (2)`, "short", "bottom");
  //             return;
  //           }
  //           const lines = data.split("\r\n");
  //           if (lines.length <= 1) {
  //             loading2.dismiss();
  //             this.presentToast(`${this.translate.instant("MSG.INVALID_CSV_FILE")} (3)`, "short", "bottom");
  //             return;
  //           }
  //           const scanRecords = [];
  //           for (var i = 1; i < lines.length; i++) {
  //             const line = lines[i];
  //             if (line.length == 0) {
  //               loading2.dismiss();
  //               this.presentToast(`${this.translate.instant("MSG.INVALID_CSV_FILE")} (4)`, "short", "bottom");
  //               return;
  //             }
  //             const items = line.split(`","`);
  //             if (items.length != 7) {
  //               loading2.dismiss();
  //               this.presentToast(`${this.translate.instant("MSG.INVALID_CSV_FILE")} (5)`, "short", "bottom");
  //               return;
  //             }
  //             const id = items[0].replace(`"`, "");
  //             if (isNaN(parseInt(id))) {
  //               loading2.dismiss();
  //               this.presentToast(`${this.translate.instant("MSG.INVALID_CSV_FILE")} (6)`, "short", "bottom");
  //               return;
  //             }
  //           }
  //           if (scanRecords.length > 0) {
  //             await this.env.saveRestoredScanRecords(scanRecords);
  //           }
  //         }
  //       ).catch(
  //         err => {
  //           loading1.dismiss();
  //           if (this.env.debugMode === 'on') {
  //             this.presentToast('Failed to read file', "long", "bottom");
  //           } else {
  //             this.presentToast(this.translate.instant("MSG.IMPORT_FAILED"), "short", "bottom");
  //           }
  //         }
  //       )
  //     }
  //   ).catch(
  //     err => {
  //       loading1.dismiss();
  //       if (this.env.isDebugging) {
  //         this.presentToast("Error when call Chooser.getFile: " + JSON.stringify(err), "long", "top");
  //       } else {
  //         this.presentToast(this.translate.instant("MSG.IMPORT_FAILED"), "short", "bottom");
  //       }
  //     }
  //   )
  // }

  maskDatetime(date: Date): string {
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
    return format(date, "PP pp", { locale: locale });
  }

  maskSource(source: 'create' | 'view' | 'scan' | undefined): string {
    if (source == null) {
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
        return `${this.translate.instant("CREATED")}`;
      case 'view':
        return `${this.translate.instant("VIEWED")}`;
      case 'scan':
        return `${this.translate.instant("SCANNED")}`;
    }
  }

  async presentToast(msg: string, duration: "short" | "long", pos: "top" | "center" | "bottom") {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos
    });
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg
    });
    await loading.present();
    return loading;
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

  get color() {
    switch (this.env.colorTheme) {
      case 'dark':
        return 'dark';
      case 'light':
        return 'white';
      case 'black':
        return 'black';
      default:
        return 'white';
    }
  }

  get isIOS() {
    return this.platform.is('ios');
  }
}
