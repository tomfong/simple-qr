import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingColorPage } from './setting-color.page';

const routes: Routes = [
  {
    path: '',
    component: SettingColorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingColorPageRoutingModule {}
