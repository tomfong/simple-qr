import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingSearchEnginePage } from './setting-search-engine.page';

const routes: Routes = [
  {
    path: '',
    component: SettingSearchEnginePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingSearchEnginePageRoutingModule {}
