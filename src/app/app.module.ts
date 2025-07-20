import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';
import { ThemeDetection } from '@awesome-cordova-plugins/theme-detection/ngx';
import { AES256 } from '@awesome-cordova-plugins/aes-256/ngx';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DatePipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EnvService } from './services/env.service';
import { FormsModule } from '@angular/forms';
import { QrCodePageModule } from './modals/qr-code/qr-code.module';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({ innerHTMLTemplatesEnabled: true }),
        AppRoutingModule,
        FormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        IonicStorageModule.forRoot(),
        QrCodePageModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatButtonModule,
        NgbModule,
    ], providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        EnvService,
        DatePipe,
        SMS,
        SocialSharing,
        ThemeDetection,
        AES256,
        Chooser,
        ScreenOrientation,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule { }
