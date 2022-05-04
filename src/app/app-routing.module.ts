import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';

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
  {
    path: 'setting-debug',
    loadChildren: () => import('./pages/setting-debug/setting-debug.module').then( m => m.SettingDebugPageModule)
  },
  {
    path: 'setting-orientation',
    loadChildren: () => import('./pages/setting-orientation/setting-orientation.module').then( m => m.SettingOrientationPageModule)
  },
  {
    path: 'setting-qr-ecl',
    loadChildren: () => import('./pages/setting-qr-ecl/setting-qr-ecl.module').then( m => m.SettingQrEclPageModule)
  },
  {
    path: 'setting-auto-brightness',
    loadChildren: () => import('./pages/setting-auto-brightness/setting-auto-brightness.module').then( m => m.SettingAutoBrightnessPageModule)
  },
  {
    path: 'setting-start-page',
    loadChildren: () => import('./pages/setting-start-page/setting-start-page.module').then( m => m.SettingStartPagePageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
