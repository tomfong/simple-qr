import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingVibrationPage } from './setting-vibration.page';

const routes: Routes = [
  {
    path: '',
    component: SettingVibrationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingVibrationPageRoutingModule {}
