import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
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
    await Preferences.set({ key: this.env.KEY_RESULT_PAGE_BUTTONS, value: this.env.resultPageButtons });
  }

  async onSearchButtonChange(ev: any) {
    this.env.showSearchButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_SEARCH_BUTTON, value: this.env.showSearchButton });
    await this.tapHaptic();
  }

  async onCopyButtonChange(ev: any) {
    this.env.showCopyButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_COPY_BUTTON, value: this.env.showCopyButton });
    await this.tapHaptic();
  }

  async onBase64ButtonChange(ev: any) {
    this.env.showBase64Button = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_BASE64_BUTTON, value: this.env.showBase64Button });
    await this.tapHaptic();
  }

  async onEnlargeButtonChange(ev: any) {
    this.env.showEnlargeButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_ENLARGE_BUTTON, value: this.env.showEnlargeButton });
    await this.tapHaptic();
  }

  async onBookmarkButtonChange(ev: any) {
    this.env.showBookmarkButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_BOOKMARK_BUTTON, value: this.env.showBookmarkButton });
    await this.tapHaptic();
  }

  async onOpenUrlButtonChange(ev: any) {
    this.env.showOpenUrlButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_OPEN_URL_BUTTON, value: this.env.showOpenUrlButton });
    await this.tapHaptic();
  }

  async onBrowseButtonChange(ev: any) {
    this.env.showBrowseButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_BROWSE_BUTTON, value: this.env.showBrowseButton });
    await this.tapHaptic();
  }

  async onAddContactButtonChange(ev: any) {
    this.env.showAddContactButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_ADD_CONTACT_BUTTON, value: this.env.showAddContactButton });
    await this.tapHaptic();
  }

  async onCallButtonChange(ev: any) {
    this.env.showCallButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_CALL_BUTTON, value: this.env.showCallButton });
    await this.tapHaptic();
  }

  async onSendMessageButtonChange(ev: any) {
    this.env.showSendMessageButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_SEND_MESSAGE_BUTTON, value: this.env.showSendMessageButton });
    await this.tapHaptic();
  }

  async onSendEmailButtonChange(ev: any) {
    this.env.showSendEmailButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_SEND_EMAIL_BUTTON, value: this.env.showSendEmailButton });
    await this.tapHaptic();
  }

  async onOpenFoodFactsButtonChange(ev: any) {
    this.env.showOpenFoodFactsButton = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_OPEN_FOOD_FACTS_BUTTON, value: this.env.showOpenFoodFactsButton });
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
