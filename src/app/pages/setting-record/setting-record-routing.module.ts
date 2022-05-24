import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingRecordPage } from './setting-record.page';

const routes: Routes = [
  {
    path: '',
    component: SettingRecordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRecordPageRoutingModule {}
