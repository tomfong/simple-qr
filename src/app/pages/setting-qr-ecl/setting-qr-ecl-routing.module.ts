import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingQrEclPage } from './setting-qr-ecl.page';

const routes: Routes = [
  {
    path: '',
    component: SettingQrEclPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingQrEclPageRoutingModule {}
