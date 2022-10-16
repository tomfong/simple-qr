import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
import { EnvService } from 'src/app/services/env.service';
import { fadeIn } from 'src/app/utils/animations';

@Component({
  selector: 'app-setting-start-page',
  templateUrl: './setting-start-page.page.html',
  styleUrls: ['./setting-start-page.page.scss'],
  animations: [fadeIn]
})
export class SettingStartPagePage {

  constructor(
    public env: EnvService,
  ) { }

  async saveStartPage() {
    await Preferences.set({ key: this.env.KEY_START_PAGE, value: this.env.startPage });
  }

  async onStartPageHeaderChange(ev: any) {
    this.env.startPageHeader = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_START_PAGE_HEADER, value: this.env.startPageHeader });
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
