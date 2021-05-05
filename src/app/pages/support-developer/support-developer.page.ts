import { Component } from '@angular/core';
import { AdMob } from '@admob-plus/ionic/ngx';
import { ActionSheetController, AlertController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-support-developer',
  templateUrl: './support-developer.page.html',
  styleUrls: ['./support-developer.page.scss'],
})
export class SupportDeveloperPage {

  constructor(
    public env: EnvService,
    private admob: AdMob,
    public toastController: ToastController,
    public actionSheetController: ActionSheetController,
    private translate: TranslateService,
    public alertController: AlertController,
  ) {

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
