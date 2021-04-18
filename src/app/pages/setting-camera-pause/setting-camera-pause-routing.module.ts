import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingCameraPausePage } from './setting-camera-pause.page';

const routes: Routes = [
  {
    path: '',
    component: SettingCameraPausePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingCameraPausePageRoutingModule {}
