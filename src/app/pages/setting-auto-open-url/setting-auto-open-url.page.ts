import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-setting-auto-open-url',
    templateUrl: './setting-auto-open-url.page.html',
    styleUrls: ['./setting-auto-open-url.page.scss'],
    standalone: false
})
export class SettingAutoOpenUrlPage {

  constructor(
    public env: EnvService,
  ) { }

  async onAutoOpenUrlChange(ev: any) {
    this.env.autoOpenUrl = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_AUTO_OPEN_URL, value: this.env.autoOpenUrl });
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
