import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportDeveloperPage } from './support-developer.page';

const routes: Routes = [
  {
    path: '',
    component: SupportDeveloperPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportDeveloperPageRoutingModule {}
