import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingLanguagePage } from './setting-language.page';

const routes: Routes = [
  {
    path: '',
    component: SettingLanguagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingLanguagePageRoutingModule {}
