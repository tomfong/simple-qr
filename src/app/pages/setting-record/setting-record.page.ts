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
    await this.env.storageSet("history-page-start-segment", this.env.historyPageStartSegment);
  }

  async onScanRecordLoggingChange(ev: any) {
    this.env.scanRecordLogging = ev ? 'on' : 'off';
    await this.env.storageSet("scan-record-logging", this.env.scanRecordLogging);
    await this.tapHaptic();
  }

  async saveRecordsLimit() {
    await this.env.storageSet("recordsLimit", this.env.recordsLimit);
    if (this.env.recordsLimit != -1 && !this.preventRecordsLimitToast) {
      this.presentToast(this.translate.instant("MSG.DELETE_OVERFLOWED_RECORDS"), "short", "bottom");
    }
  }

  async onShowNumberOfRecordsChange(ev: any) {
    this.env.showNumberOfRecords = ev ? 'on' : 'off';
    await this.env.storageSet("showNumberOfRecords", this.env.showNumberOfRecords);
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
          path: value.uri,
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
                        await this.restore(value.data, data.secret.trim());
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
