import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingAutoExitPage } from './setting-auto-exit.page';

const routes: Routes = [
  {
    path: '',
    component: SettingAutoExitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingAutoExitPageRoutingModule {}
