import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-result-buttons',
  templateUrl: './setting-result-buttons.page.html',
  styleUrls: ['./setting-result-buttons.page.scss'],
})
export class SettingResultButtonsPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveResultPageButtons() {
    await this.env.storageSet("result-page-buttons", this.env.resultPageButtons);
  }

  async onSearchButtonChange(ev: any) {
    this.env.showSearchButton = ev ? 'on' : 'off';
    await this.env.storageSet("showSearchButton", this.env.showSearchButton);
    await this.tapHaptic();
  }

  async onCopyButtonChange(ev: any) {
    this.env.showCopyButton = ev ? 'on' : 'off';
    await this.env.storageSet("showCopyButton", this.env.showCopyButton);
    await this.tapHaptic();
  }

  async onBase64ButtonChange(ev: any) {
    this.env.showBase64Button = ev ? 'on' : 'off';
    await this.env.storageSet("showBase64Button", this.env.showBase64Button);
    await this.tapHaptic();
  }

  async onEnlargeButtonChange(ev: any) {
    this.env.showEnlargeButton = ev ? 'on' : 'off';
    await this.env.storageSet("showEnlargeButton", this.env.showEnlargeButton);
    await this.tapHaptic();
  }

  async onBookmarkButtonChange(ev: any) {
    this.env.showBookmarkButton = ev ? 'on' : 'off';
    await this.env.storageSet("showBookmarkButton", this.env.showBookmarkButton);
    await this.tapHaptic();
  }

  async onBrowseButtonChange(ev: any) {
    this.env.showBrowseButton = ev ? 'on' : 'off';
    await this.env.storageSet("showBrowseButton", this.env.showBrowseButton);
    await this.tapHaptic();
  }

  async onAddContactButtonChange(ev: any) {
    this.env.showAddContactButton = ev ? 'on' : 'off';
    await this.env.storageSet("showAddContactButton", this.env.showAddContactButton);
    await this.tapHaptic();
  }

  async onCallButtonChange(ev: any) {
    this.env.showCallButton = ev ? 'on' : 'off';
    await this.env.storageSet("showCallButton", this.env.showCallButton);
    await this.tapHaptic();
  }

  async onSendMessageButtonChange(ev: any) {
    this.env.showSendMessageButton = ev ? 'on' : 'off';
    await this.env.storageSet("showSendMessageButton", this.env.showSendMessageButton);
    await this.tapHaptic();
  }

  async onSendEmailButtonChange(ev: any) {
    this.env.showSendEmailButton = ev ? 'on' : 'off';
    await this.env.storageSet("showSendEmailButton", this.env.showSendEmailButton);
    await this.tapHaptic();
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
}
