import { Component, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toast } from '@capacitor/toast';
import { LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from './services/env.service';
import { ImageService } from './services/image.service';
import { Router } from '@angular/router';
import { de } from 'date-fns/locale';
import { set } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private static readonly MAX_SHARED_TEXT_LEN = 1817;

  constructor(
    private translate: TranslateService,
    public env: EnvService,
    private platform: Platform,
    private router: Router,
    private ngZone: NgZone,
    private imageService: ImageService,
    private loadingController: LoadingController,
  ) {
    this.translate.addLangs(this.env.languages);
    this.translate.setDefaultLang('en');

    // Initialize app listeners after platform is ready
    this.platform.ready().then(() => {
      this.initAppListeners();
      // With SplashScreen.launchAutoHide=false we must hide manually.
      // Do it globally so deep-link cold-starts (e.g. share -> result) don't get stuck.
      setTimeout(() => {
        SplashScreen.hide().catch(() => {
          // Ignore
        });
      }, 300);
      // Set flag synchronously before async check to prevent race condition
      this.env.pendingLaunchUrlCheck = true;
      this.checkLaunchUrl();
    });
  }

  private initAppListeners(): void {
    // Handle app state changes (iOS)
    if (this.platform.is('ios')) {
      App.addListener('appStateChange', async ({ isActive }) => {
        if (this.env.isDebugging) {
          this.presentToast(
            `App state changed. Is active?: ${isActive}`,
            'short',
            'bottom',
          );
        }
        if (isActive) {
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 300);
        } else {
          await SplashScreen.show({
            autoHide: false,
          });
        }
      });
    }

    // Handle app URL open (iOS and Android)
    App.addListener('appUrlOpen', async ({ url }) => {
      this.ngZone.run(() => {
        this.handleSharedUrl(url);
      });
    });
  }

  private async checkLaunchUrl(): Promise<void> {
    try {
      const url = await App.getLaunchUrl();
      if (url?.url) {
        this.ngZone.run(() => {
          this.handleSharedUrl(url.url);
        });
      }
    } catch (error) {
      // Ignore
    }
  }

  private handleSharedUrl(url: string): void {
    if (!url) return;

    let sharedText: string | null = null;

    // Handle custom URL scheme: simpleqr://share?text=<encoded_text>
    if (url.startsWith('simpleqr://share?text=')) {
      const encodedText = url.replace('simpleqr://share?text=', '');
      sharedText = decodeURIComponent(encodedText);
    }
    // Handle Android share intent: intent://#Intent;...;S.android.intent.extra.TEXT=<text>;end
    else if (url.includes('android.intent.action.SEND')) {
      const textMatch = url.match(/S\.android\.intent\.extra\.TEXT=([^;]+)/);
      if (textMatch && textMatch[1]) {
        sharedText = decodeURIComponent(textMatch[1]);
      }
    }
    // Handle image share from external apps: simpleqr://scan-image?path=<encoded_path>
    else if (url.startsWith('simpleqr://scan-image?')) {
      this.handleSharedImage(url);
      return;
    }

    if (sharedText) {
      this.handleSharedText(sharedText);
    }
  }

  private async handleSharedImage(url: string): Promise<void> {
    try {
      const params = new URL(url).searchParams;
      const isIos = this.platform.is('ios');
      let filePath: string;

      if (isIos) {
        // iOS: image saved to App Groups shared container by Share Extension
        // URL format: simpleqr://scan-image?id=<filename>
        const filename = params.get('id');
        if (!filename) return;
        // App Groups container path on iOS
        filePath = `file:///var/mobile/Containers/Shared/AppGroup/group.com.tomfong.simpleqr/SharedImages/${filename}`;
      } else {
        // Android: image copied to app cache, path passed directly
        // URL format: simpleqr://scan-image?path=<encoded-cache-path>
        const encodedPath = params.get('path');
        if (!encodedPath) return;
        filePath = decodeURIComponent(encodedPath);
      }

      const decodingLoading = await this.presentLoading(
        this.translate.instant('DECODING'),
      );

      const { data } = await this.imageService
        .scanQrFromFilePath(filePath)
        .finally(() => {
          decodingLoading.dismiss();
        });

      this.env.resultContent = data;
      this.env.isSharedContent = true;
      this.env.pendingShareNavigation = true;

      this.router.navigate(['tabs/landing']).then(() => {
        setTimeout(() => {
          this.env.resultContentFormat = 'QR_CODE';
          this.env.recordSource = 'external-share';
          this.env.detailedRecordSource = 'external-share';
          this.env.viewResultFrom = '/tabs/history';
          this.router
            .navigate(['tabs/result'], {
              replaceUrl: true,
              queryParams: { refresh: new Date().getTime() },
            })
            .finally(() => {
              // Allow normal startup navigation again once result page routing is triggered
              setTimeout(() => {
                this.env.pendingShareNavigation = false;
              }, 300);
            });
        }, 200);
      });
    } catch (_) {
      setTimeout(() => {
        this.presentToast(
          this.translate.instant('MSG.NO_QR_CODE'),
          'short',
          'center',
        );
        this.router.navigate(['tabs/history'], { replaceUrl: true });
      }, 200);
    }
  }

  private handleSharedText(text: string): void {
    const sanitized = this.sanitizeExternalSharedText(text);
    if (sanitized && sanitized.trim().length > 0) {
      // Set result content and navigate to result page as freeText type
      this.env.resultContent = sanitized;
      this.env.isSharedContent = true; // Mark as shared to force freeText type
      this.env.pendingShareNavigation = true;

      this.router.navigate(['tabs/landing']).then(() => {
        setTimeout(() => {
          this.env.recordSource = 'external-share';
          this.env.detailedRecordSource = 'external-share';
          this.env.viewResultFrom = '/tabs/history';
          this.router
            .navigate(['tabs/result'], {
              replaceUrl: true,
              queryParams: { refresh: new Date().getTime() },
            })
            .finally(() => {
              // Allow normal startup navigation again once result page routing is triggered
              setTimeout(() => {
                this.env.pendingShareNavigation = false;
              }, 300);
            });
        }, 200);
      });
    }
  }

  /**
   * External share text should be treated as plain text.
   * - Strip control chars (except \t, \n, \r) to avoid odd rendering/issues
   * - Trim
   * - Enforce QR max content length (1817 chars) to avoid generating invalid/huge payloads
   */
  private sanitizeExternalSharedText(text: string): string {
    if (!text) return '';

    // Remove ASCII control chars except TAB(0x09), LF(0x0A), CR(0x0D)
    const withoutControlChars = text.replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      '',
    );

    const trimmed = withoutControlChars.trim();
    if (trimmed.length <= AppComponent.MAX_SHARED_TEXT_LEN) {
      return trimmed;
    }

    // Truncate and notify user
    const truncated = trimmed.slice(0, AppComponent.MAX_SHARED_TEXT_LEN);
    this.presentToast(
      this.translate.instant('MSG.CREATE_QRCODE_MAX_LENGTH'),
      'short',
      'bottom',
    );
    return truncated;
  }

  async presentLoading(msg: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: msg,
    });
    await loading.present();
    return loading;
  }

  async presentToast(
    msg: string,
    duration: 'short' | 'long',
    pos: 'top' | 'center' | 'bottom',
  ) {
    await Toast.show({
      text: msg,
      duration: duration,
      position: pos,
    });
  }
}
