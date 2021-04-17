import { Component, ViewChild } from '@angular/core';
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
    public toastController: ToastController,
    public translate: TranslateService,
    public env: EnvService,
  ) { 
    setTimeout(
      () =>{
        this.contentEl.scrollToBottom(500);
      }, 750
    );
  }

  async saveTutorialShowing() {
    if (this.env.notShowHistoryTutorial === true) {
      await this.env.storageSet("not-show-history-tutorial", 'yes');
    } else {
      await this.env.storageSet("not-show-history-tutorial", 'no');
    }
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
 
}
