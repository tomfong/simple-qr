import { Component, ViewChild } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-history-tutorial',
  templateUrl: './history-tutorial.page.html',
  styleUrls: ['./history-tutorial.page.scss'],
})
export class HistoryTutorialPage {

  @ViewChild('content') contentEl: HTMLIonContentElement;

  constructor(
    public modalController: ModalController,
    public translate: TranslateService,
    public env: EnvService,
  ) {
    setTimeout(
      () => {
        this.contentEl.scrollToBottom(500);
      }, 750
    );
  }

  async saveHistoryTutorialShowing() {
    if (this.env.notShowHistoryTutorial === true) {
      await this.env.storageSet("not-show-history-tutorial", 'yes');
    } else {
      await this.env.storageSet("not-show-history-tutorial", 'no');
    }
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Medium })
        .catch(async err => {
          if (this.env.debugMode === 'on') {
            await Toast.show({ text: 'Err when Haptics.impact: ' + JSON.stringify(err), position: "top", duration: "long" })
          }
        })
    }
  }

  closeModal(): void {
    this.modalController.dismiss();
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

}
