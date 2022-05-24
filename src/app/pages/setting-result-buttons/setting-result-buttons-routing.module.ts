import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingResultButtonsPage } from './setting-result-buttons.page';

const routes: Routes = [
  {
    path: '',
    component: SettingResultButtonsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingResultButtonsPageRoutingModule {}
