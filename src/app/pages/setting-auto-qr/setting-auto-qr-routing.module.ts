import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingAutoQrPage } from './setting-auto-qr.page';

const routes: Routes = [
  {
    path: '',
    component: SettingAutoQrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingAutoQrPageRoutingModule {}
