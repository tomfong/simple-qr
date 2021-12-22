import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
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
  {
    path: 'setting-search-engine',
    loadChildren: () => import('./pages/setting-search-engine/setting-search-engine.module').then( m => m.SettingSearchEnginePageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'setting-vibration',
    loadChildren: () => import('./pages/setting-vibration/setting-vibration.module').then( m => m.SettingVibrationPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
