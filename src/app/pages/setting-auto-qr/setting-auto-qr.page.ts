import { Component } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-setting-auto-qr',
  templateUrl: './setting-auto-qr.page.html',
  styleUrls: ['./setting-auto-qr.page.scss'],
})
export class SettingAutoQrPage {

  constructor(
    public env: EnvService,
  ) { }

  async onShowQrAfterCameraScanChange(ev: any) {
    this.env.showQrAfterCameraScan = ev ? 'on' : 'off';
    await this.env.storageSet("show-qr-after-camera-scan", this.env.showQrAfterCameraScan);
    await this.tapHaptic();
  }

  async onShowQrAfterImageScanChange(ev: any) {
    this.env.showQrAfterImageScan = ev ? 'on' : 'off';
    await this.env.storageSet("show-qr-after-image-scan", this.env.showQrAfterImageScan);
    await this.tapHaptic();
  }

  async onShowQrAfterCreateChange(ev: any) {
    this.env.showQrAfterCreate = ev ? 'on' : 'off';
    await this.env.storageSet("show-qr-after-create", this.env.showQrAfterCreate);
    await this.tapHaptic();
  }

  async onShowQrAfterLogViewChange(ev: any) {
    this.env.showQrAfterLogView = ev ? 'on' : 'off';
    await this.env.storageSet("show-qr-after-log-view", this.env.showQrAfterLogView);
    await this.tapHaptic();
  }

  async onShowQrAfterBookmarkViewChange(ev: any) {
    this.env.showQrAfterBookmarkView = ev ? 'on' : 'off';
    await this.env.storageSet("show-qr-after-bookmark-view", this.env.showQrAfterBookmarkView);
    await this.tapHaptic();
  }

  async tapHaptic() {
    if (this.env.vibration === 'on' || this.env.vibration === 'on-haptic') {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  }
}
