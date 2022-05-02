import { Component, ViewChild } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-bookmark-tutorial',
  templateUrl: './bookmark-tutorial.page.html',
  styleUrls: ['./bookmark-tutorial.page.scss'],
})
export class BookmarkTutorialPage {

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
  
  async saveBookmarkTutorialShowing() {
    if (this.env.notShowBookmarkTutorial === true) {
      await this.env.storageSet("not-show-bookmark-tutorial", 'yes');
    } else {
      await this.env.storageSet("not-show-bookmark-tutorial", 'no');
    }
  }
  
  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Medium });
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
