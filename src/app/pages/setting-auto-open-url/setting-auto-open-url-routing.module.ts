import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingAutoOpenUrlPage } from './setting-auto-open-url.page';

const routes: Routes = [
  {
    path: '',
    component: SettingAutoOpenUrlPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingAutoOpenUrlPageRoutingModule {}
