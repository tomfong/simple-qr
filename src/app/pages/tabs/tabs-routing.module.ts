import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: '/tabs/landing',
        pathMatch: 'full'
      },
      {
        path: 'landing',
        data: { preload: true },
        loadChildren: () => import('../landing/landing.module').then(m => m.LandingPageModule)
      },
      {
        path: 'scan',
        data: { preload: true },
        loadChildren: () => import('../scan/scan.module').then(m => m.ScanPageModule)
      },
      {
        path: 'result',
        data: { preload: true },
        loadChildren: () => import('../result/result.module').then(m => m.ResultPageModule)
      },
      {
        path: 'history',
        data: { preload: true },
        loadChildren: () => import('../history/history.module').then(m => m.HistoryPageModule)
      },
      {
        path: 'setting',
        data: { preload: true },
        loadChildren: () => import('../setting/setting.module').then(m => m.SettingPageModule)
      },
      {
        path: 'generate',
        data: { preload: true },
        loadChildren: () => import('../generate/generate.module').then(m => m.GeneratePageModule)
      },
      {
        path: 'import-image',
        data: { preload: true },
        loadChildren: () => import('../import-image/import-image.module').then(m => m.ImportImagePageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/landing',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
