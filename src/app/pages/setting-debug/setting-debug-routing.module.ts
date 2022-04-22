import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingDebugPage } from './setting-debug.page';

const routes: Routes = [
  {
    path: '',
    component: SettingDebugPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingDebugPageRoutingModule {}
