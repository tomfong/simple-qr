import { Component } from '@angular/core';
import { AdMob } from '@admob-plus/ionic/ngx';
import { ActionSheetController, AlertController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { IAPProduct, IAPProducts, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-support-developer',
  templateUrl: './support-developer.page.html',
  styleUrls: ['./support-developer.page.scss'],
})
export class SupportDeveloperPage {

  products: IAPProducts;
  showRestoreBtn: boolean = false;

  smallMilkTeaDonorUnlocked: boolean = false;
  largeMilkTeaDonorUnlocked: boolean = false;
  extraLargeMilkTeaDonorUnlocked: boolean = false;
  premiumMilkTeaDonorUnlocked: boolean = false;

  constructor(
    public env: EnvService,
    private admob: AdMob,
    public toastController: ToastController,
    public actionSheetController: ActionSheetController,
    private translate: TranslateService,
    private inAppPurchase: InAppPurchase2,
    private platform: Platform,
    public alertController: AlertController,
  ) {
    this.platform.ready().then(
      async () => {
        this.inAppPurchase.verbosity = this.inAppPurchase.DEBUG;
        this.inAppPurchase.register({
          id: environment.classicMilkTeaPK,
          type: this.inAppPurchase.NON_CONSUMABLE
        });
        this.inAppPurchase.register({
          id: environment.pearlMilkTeaPK,
          type: this.inAppPurchase.NON_CONSUMABLE
        });
        this.inAppPurchase.register({
          id: environment.fancyMilkTeaPK,
          type: this.inAppPurchase.NON_CONSUMABLE
        });
        this.inAppPurchase.register({
          id: environment.premiumMilkTeaPK,
          type: this.inAppPurchase.NON_CONSUMABLE
        });
        this.inAppPurchase.when(environment.classicMilkTeaPK)
          .owned((p: IAPProduct) => {
            this.smallMilkTeaDonorUnlocked = true;
          })
          .approved((p: IAPProduct) => p.verify())
          .verified((p: IAPProduct) => p.finish())
          .finished((p: IAPProduct) => {
            this.showRestoreBtn = true;
          });
        this.inAppPurchase.when(environment.pearlMilkTeaPK)
          .owned((p: IAPProduct) => {
            this.largeMilkTeaDonorUnlocked = true;
          })
          .approved((p: IAPProduct) => p.verify())
          .verified((p: IAPProduct) => p.finish())
          .finished((p: IAPProduct) => {
            this.showRestoreBtn = true;
          });
        this.inAppPurchase.when(environment.fancyMilkTeaPK)
          .owned((p: IAPProduct) => {
            this.extraLargeMilkTeaDonorUnlocked = true;
          })
          .approved((p: IAPProduct) => p.verify())
          .verified((p: IAPProduct) => p.finish())
          .finished((p: IAPProduct) => {
            this.showRestoreBtn = true;
          });
        this.inAppPurchase.when(environment.premiumMilkTeaPK)
          .owned((p: IAPProduct) => {
            this.premiumMilkTeaDonorUnlocked = true;
          })
          .approved((p: IAPProduct) => p.verify())
          .verified((p: IAPProduct) => p.finish())
          .finished((p: IAPProduct) => {
            this.showRestoreBtn = true;
          });
        this.inAppPurchase.refresh();
        this.inAppPurchase.ready(() => {
          this.products = this.inAppPurchase.products;
        });
      }
    );
  }

  async watchAds() {
    let thanksToast = await this.presentToast(this.translate.instant("THANKS_SUPPORT"), 0, "bottom", "center", "long");
    let notLoadToast: HTMLIonToastElement;
    await this.admob.start().catch(
      async err => {
        if (thanksToast) {
          await thanksToast.dismiss();
          thanksToast = null;
        }
        console.error("start ad failed", err);
        if (!notLoadToast) {
          notLoadToast = await this.presentToast(this.translate.instant("MSG.FAIL_START_ADS"), 2000, "bottom", "center", "long");
          notLoadToast.onDidDismiss().then(
            () => {
              notLoadToast = undefined;
            }
          );
        }
      }
    );
    const interstitial = new this.admob.InterstitialAd({
      adUnitId: 'ca-app-pub-1258868559061405/2974771602',
    });
    await interstitial.load().catch(
      async err => {
        if (thanksToast) {
          await thanksToast.dismiss();
          thanksToast = null;
        }
        console.error("load ad failed", err);
        if (!notLoadToast) {
          notLoadToast = await this.presentToast(this.translate.instant("MSG.FAIL_LOAD_ADS"), 2000, "bottom", "center", "long");
          notLoadToast.onDidDismiss().then(
            () => {
              notLoadToast = undefined;
            }
          );
        }
      }
    );
    await interstitial.show().then(
      async () => {
        if (thanksToast) {
          await thanksToast.dismiss();
          thanksToast = null;
        }
      }
    ).catch(
      async err => {
        if (thanksToast) {
          await thanksToast.dismiss();
          thanksToast = null;
        }
        console.error("show ad failed", err);
        if (!notLoadToast) {
          notLoadToast = await this.presentToast(this.translate.instant("MSG.FAIL_SHOW_ADS"), 2000, "bottom", "center", "long");
          notLoadToast.onDidDismiss().then(
            () => {
              notLoadToast = undefined;
            }
          );
        }
      }
    );
    if (thanksToast) {
      await thanksToast.dismiss();
      thanksToast = null;
    }
  }

  openPaypal() {
    window.open(environment.paypalDonateUrl, '_system');
  }

  async buyMilkTea() {
    const actionSheet = await this.actionSheetController.create(
      {
        mode: "ios",
        translucent: true,
        header: this.translate.instant('TASTE_MILKTEA'),
        buttons: [
          {
            text: this.translate.instant('CL_MILKTEA'),
            handler: async () => {
              const product = this.products.find(p => p.id === environment.classicMilkTeaPK);
              if (product !== undefined) {
                await this.inAppPurchase.order(product).then(
                  async (value: any) => {
                    console.log("buying small milktea", value);
                    actionSheet.dismiss();
                    // this.presentAlert(this.translate.instant("SUCCESS_BUY_MILK_TEA"), this.translate.instant("SUCCESS"), this.translate.instant("OK"), false);
                  },
                  async (err: any) => {
                    console.error("error in buying small milktea", err);
                    actionSheet.dismiss();
                    this.presentToast(this.translate.instant("FAIL_BUY_MILK_TEA"), 1500, 'bottom', 'center', 'long');
                  }
                );
              }
            }
          },
          {
            text: this.translate.instant('PE_MILKTEA'),
            handler: async () => {
              const product = this.products.find(p => p.id === environment.pearlMilkTeaPK);
              if (product !== undefined) {
                await this.inAppPurchase.order(product).then(
                  async (value: any) => {
                    console.log("buying small milktea", value);
                    actionSheet.dismiss();
                    // this.presentAlert(this.translate.instant("SUCCESS_BUY_MILK_TEA"), this.translate.instant("SUCCESS"), this.translate.instant("OK"), false);
                  },
                  async (err: any) => {
                    console.error("error in buying small milktea", err);
                    actionSheet.dismiss();
                    this.presentToast(this.translate.instant("FAIL_BUY_MILK_TEA"), 1500, 'bottom', 'center', 'long');
                  }
                );
              }
            }
          },
          {
            text: this.translate.instant('FA_MILKTEA'),
            handler: async () => {
              const product = this.products.find(p => p.id === environment.fancyMilkTeaPK);
              if (product !== undefined) {
                await this.inAppPurchase.order(product).then(
                  async (value: any) => {
                    console.log("buying small milktea", value);
                    actionSheet.dismiss();
                    // this.presentAlert(this.translate.instant("SUCCESS_BUY_MILK_TEA"), this.translate.instant("SUCCESS"), this.translate.instant("OK"), false);
                  },
                  async (err: any) => {
                    console.error("error in buying small milktea", err);
                    actionSheet.dismiss();
                    this.presentToast(this.translate.instant("FAIL_BUY_MILK_TEA"), 1500, 'bottom', 'center', 'long');
                  }
                );
              }
            }
          },
          {
            text: this.translate.instant('PR_MILKTEA'),
            handler: async () => {
              const product = this.products.find(p => p.id === environment.premiumMilkTeaPK);
              if (product !== undefined) {
                await this.inAppPurchase.order(product).then(
                  async (value: any) => {
                    console.log("buying small milktea", value);
                    actionSheet.dismiss();
                    // this.presentAlert(this.translate.instant("SUCCESS_BUY_MILK_TEA"), this.translate.instant("SUCCESS"), this.translate.instant("OK"), false);
                  },
                  async (err: any) => {
                    console.error("error in buying small milktea", err);
                    actionSheet.dismiss();
                    this.presentToast(this.translate.instant("FAIL_BUY_MILK_TEA"), 1500, 'bottom', 'center', 'long');
                  }
                );
              }
            }
          }
        ]
      }
    )
    actionSheet.present();
  }

  async showPremiumMilkTeaDonorUnlocked() {
    await this.presentAlert(this.translate.instant('MSG.UNLOCKED_PR_MILKTEA_DONATE_BADGE'), this.translate.instant('PR_MILKTEA_DONATE_BADGE'), this.translate.instant('OK'), false);
  }

  async showExtraLargeMilkTeaDonorUnlocked() {
    await this.presentAlert(this.translate.instant('MSG.UNLOCKED_FA_MILKTEA_DONATE_BADGE'), this.translate.instant('FA_MILKTEA_DONATE_BADGE'), this.translate.instant('OK'), false);
  }

  async showLargeMilkTeaDonorUnlocked() {
    await this.presentAlert(this.translate.instant('MSG.UNLOCKED_PE_MILKTEA_DONATE_BADGE'), this.translate.instant('PE_MILKTEA_DONATE_BADGE'), this.translate.instant('OK'), false);
  }

  async showSmallMilkTeaDonorUnlocked() {
    await this.presentAlert(this.translate.instant('MSG.UNLOCKED_CL_MILKTEA_DONATE_BADGE'), this.translate.instant('CL_MILKTEA_DONATE_BADGE'), this.translate.instant('OK'), false);
  }

  async restore() {
    const alert = await this.alertController.create(
      {
        header: this.translate.instant('RESTORE_PURCHASE'),
        message: this.translate.instant('CONFIRM_RESTORE_PURCHASE'),
        buttons: [
          {
            text: this.translate.instant('YES'),
            handler: () => {
              this.showRestoreBtn = false;
              this.inAppPurchase.refresh();
              this.presentToast(this.translate.instant("RESTORED"), 1000, 'middle', 'center', 'short');
            }
          },
          {
            text: this.translate.instant('NO'),
            role: 'cancel',
            cssClass: 'btn-inverse'
          }
        ]
      }
    )
    alert.present();
  }

  async presentToast(msg: string, msTimeout: number, pos: "top" | "middle" | "bottom", align: "left" | "center", size: "short" | "long") {
    let toast: HTMLIonToastElement;
    if (size === "long") {
      if (align === "left") {
        toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-start-toast",
          position: pos
        });
        await toast.present();
      } else {
        toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-center-toast",
          position: pos
        });
        await toast.present();
      }
    } else {
      if (align === "left") {
        toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-start-short-toast",
          position: pos
        });
        await toast.present();
      } else {
        toast = await this.toastController.create({
          message: msg,
          duration: msTimeout,
          mode: "ios",
          color: "light",
          cssClass: "text-center-short-toast",
          position: pos
        });
        await toast.present();
      }
    }
    return toast;
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
