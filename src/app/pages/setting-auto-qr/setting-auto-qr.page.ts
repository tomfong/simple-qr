import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
import { EnvService } from 'src/app/services/env.service';

@Component({
    selector: 'app-setting-auto-qr',
    templateUrl: './setting-auto-qr.page.html',
    styleUrls: ['./setting-auto-qr.page.scss'],
    standalone: false
})
export class SettingAutoQrPage {

  constructor(
    public env: EnvService,
  ) { }

  async onShowQrAfterCameraScanChange(ev: any) {
    this.env.showQrAfterCameraScan = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_QR_AFTER_CAMERA_SCAN, value: this.env.showQrAfterCameraScan });
    await this.tapHaptic();
  }

  async onShowQrAfterImageScanChange(ev: any) {
    this.env.showQrAfterImageScan = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_QR_AFTER_IMAGE_SCAN, value: this.env.showQrAfterImageScan });
    await this.tapHaptic();
  }

  async onShowQrAfterCreateChange(ev: any) {
    this.env.showQrAfterCreate = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_QR_AFTER_CREATE, value: this.env.showQrAfterCreate });
    await this.tapHaptic();
  }

  async onShowQrAfterLogViewChange(ev: any) {
    this.env.showQrAfterLogView = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_QR_AFTER_LOG_VIEW, value: this.env.showQrAfterLogView });
    await this.tapHaptic();
  }

  async onShowQrAfterBookmarkViewChange(ev: any) {
    this.env.showQrAfterBookmarkView = ev ? 'on' : 'off';
    await Preferences.set({ key: this.env.KEY_SHOW_QR_AFTER_BOOKMARK_VIEW, value: this.env.showQrAfterBookmarkView });
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
