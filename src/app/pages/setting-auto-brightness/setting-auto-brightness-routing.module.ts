import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingAutoBrightnessPage } from './setting-auto-brightness.page';

const routes: Routes = [
  {
    path: '',
    component: SettingAutoBrightnessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingAutoBrightnessPageRoutingModule {}
