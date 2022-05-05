import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingStartPagePage } from './setting-start-page.page';

const routes: Routes = [
  {
    path: '',
    component: SettingStartPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingStartPagePageRoutingModule {}
