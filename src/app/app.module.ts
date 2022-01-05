import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { DeviceMotion } from '@ionic-native/device-motion/ngx';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Vibration } from '@ionic-native/vibration/ngx';
import { IonicStorageModule } from '@ionic/storage-angular';
//import { Clipboard } from '@ionic-native/clipboard/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { ThemeDetection } from '@ionic-native/theme-detection/ngx';
//import { Device } from '@ionic-native/device/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
//import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HistoryTutorialPageModule } from './modals/history-tutorial/history-tutorial.module';
import { DatePipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent } from './components/menu/menu.component';
import { QrcodeComponent } from './components/qrcode/qrcode.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    QrcodeComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot(),
    HistoryTutorialPageModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatButtonModule,
    NgbModule,
    NgxQRCodeModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AppVersion,
    CallNumber,
    // Camera,
    DatePipe,
    DeviceMotion,
    File,
    OpenNativeSettings,
    QRScanner,
    SMS,
    SocialSharing,
    ThemeDetection,
    Vibration,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
