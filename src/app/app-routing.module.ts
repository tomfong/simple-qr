import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'scan',
    pathMatch: 'full'
  },
  {
    path: 'scan',
    loadChildren: () => import('./pages/scan/scan.module').then( m => m.ScanPageModule)
  },
  {
    path: 'result',
    loadChildren: () => import('./pages/result/result.module').then( m => m.ResultPageModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./pages/history/history.module').then( m => m.HistoryPageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./pages/setting/setting.module').then( m => m.SettingPageModule)
  },  {
    path: 'setting-language',
    loadChildren: () => import('./pages/setting-language/setting-language.module').then( m => m.SettingLanguagePageModule)
  },
  {
    path: 'setting-color',
    loadChildren: () => import('./pages/setting-color/setting-color.module').then( m => m.SettingColorPageModule)
  },
  {
    path: 'setting-camera-pause',
    loadChildren: () => import('./pages/setting-camera-pause/setting-camera-pause.module').then( m => m.SettingCameraPausePageModule)
  },
  {
    path: 'setting-record',
    loadChildren: () => import('./pages/setting-record/setting-record.module').then( m => m.SettingRecordPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
