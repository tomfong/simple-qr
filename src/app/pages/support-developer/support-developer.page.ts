import { Component } from '@angular/core';
import { AdMob } from '@admob-plus/ionic/ngx';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

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
    private translate: TranslateService,
  ) { }

  async watchAds() {
    let thanksToast = await this.presentToast(this.translate.instant("THANKS_SUPPORT"), 0, "bottom", "center", "long");
    await this.admob.start().catch(
      async err => {
        if (thanksToast) {
          await thanksToast.dismiss();
          thanksToast = null;
        }
        console.error("start ad failed", err);
        await this.presentToast(this.translate.instant("MSG.FAIL_LOAD_ADS"), 2000, "bottom", "center", "long");
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
        await this.presentToast(this.translate.instant("MSG.FAIL_LOAD_ADS"), 2000, "bottom", "center", "long");
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
        await this.presentToast(this.translate.instant("MSG.FAIL_LOAD_ADS"), 2000, "bottom", "center", "long");
      }
    );
    if (thanksToast) {
      await thanksToast.dismiss();
      thanksToast = null;
    }
  }

  async buyMilkTea() {
    this.presentToast(this.translate.instant("DEVELOPING"), 1500, 'bottom', 'center', 'short');
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

}
