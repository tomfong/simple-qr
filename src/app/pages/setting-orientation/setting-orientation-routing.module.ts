import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingOrientationPage } from './setting-orientation.page';

const routes: Routes = [
  {
    path: '',
    component: SettingOrientationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingOrientationPageRoutingModule {}
