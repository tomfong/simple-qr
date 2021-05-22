import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GeneratePage } from './generate.page';

const routes: Routes = [
  {
    path: '',
    component: GeneratePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneratePageRoutingModule {}
