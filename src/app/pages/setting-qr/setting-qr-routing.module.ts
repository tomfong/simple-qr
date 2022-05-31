import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingQrPage } from './setting-qr.page';

const routes: Routes = [
  {
    path: '',
    component: SettingQrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingQrPageRoutingModule {}
