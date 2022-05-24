import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportImagePage } from './import-image.page';

const routes: Routes = [
  {
    path: '',
    component: ImportImagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportImagePageRoutingModule {}
