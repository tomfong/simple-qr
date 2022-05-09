import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingResultPage } from './setting-result.page';

const routes: Routes = [
  {
    path: '',
    component: SettingResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingResultPageRoutingModule {}
