import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-auto-brightness',
  templateUrl: './setting-auto-brightness.page.html',
  styleUrls: ['./setting-auto-brightness.page.scss'],
})
export class SettingAutoBrightnessPage {

  constructor(
    public env: EnvService,
  ) { }

  async saveAutoMaxBrightness() {
    await this.env.storageSet("auto-max-brightness", this.env.autoMaxBrightness);
  }

  async onAutoMaxBrightnessChange(ev: any) {
    this.env.autoMaxBrightness = ev ? 'on' : 'off';
    await this.env.storageSet("auto-max-brightness", this.env.autoMaxBrightness);
    await this.tapHaptic();
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
}
