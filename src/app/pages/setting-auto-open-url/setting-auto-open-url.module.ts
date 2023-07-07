import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingAutoOpenUrlPageRoutingModule } from './setting-auto-open-url-routing.module';

import { SettingAutoOpenUrlPage } from './setting-auto-open-url.page';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from 'src/app/utils/helpers';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SettingAutoOpenUrlPageRoutingModule
  ],
  declarations: [SettingAutoOpenUrlPage]
})
export class SettingAutoOpenUrlPageModule {}
