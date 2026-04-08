import { Component, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toast } from '@capacitor/toast';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { EnvService } from './services/env.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    translate: TranslateService,
    public env: EnvService,
    private platform: Platform,
    private router: Router,
    private ngZone: NgZone,
  ) {
    translate.addLangs(this.env.languages);
    translate.setDefaultLang('en');

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

    if (sharedText) {
      this.handleSharedText(sharedText);
    }
  }

  private handleSharedText(text: string): void {
    if (text && text.trim().length > 0) {
      // Set result content and navigate to result page as freeText type
      this.env.resultContent = text.trim();
      this.env.isSharedContent = true; // Mark as shared to force freeText type
      this.env.pendingShareNavigation = true;
      this.env.recordSource = 'external-share';
      this.env.detailedRecordSource = 'external-share';
      this.env.viewResultFrom = '/tabs/history';

      // Navigate to result page - use setTimeout to ensure it happens after initial routing
      setTimeout(() => {
        this.router
          .navigateByUrl('/tabs/result', { replaceUrl: true })
          .finally(() => {
            // Allow normal startup navigation again once result page routing is triggered
            setTimeout(() => {
              this.env.pendingShareNavigation = false;
            }, 300);
          });
      }, 100);
    }
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
