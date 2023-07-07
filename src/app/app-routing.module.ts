import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';
import { CustomPreloadingStrategyService } from './services/custom-preloading-strategy.service';

const routes: Routes = [
  {
    path: '',
    data: { preload: true },
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'setting-language',
    loadChildren: () => import('./pages/setting-language/setting-language.module').then(m => m.SettingLanguagePageModule)
  },
  {
    path: 'setting-color',
    loadChildren: () => import('./pages/setting-color/setting-color.module').then(m => m.SettingColorPageModule)
  },
  {
    path: 'setting-record',
    loadChildren: () => import('./pages/setting-record/setting-record.module').then(m => m.SettingRecordPageModule)
  },
  {
    path: 'setting-search-engine',
    loadChildren: () => import('./pages/setting-search-engine/setting-search-engine.module').then(m => m.SettingSearchEnginePageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule)
  },
  {
    path: 'setting-vibration',
    loadChildren: () => import('./pages/setting-vibration/setting-vibration.module').then(m => m.SettingVibrationPageModule)
  },
  {
    path: 'setting-debug',
    loadChildren: () => import('./pages/setting-debug/setting-debug.module').then(m => m.SettingDebugPageModule)
  },
  {
    path: 'setting-orientation',
    loadChildren: () => import('./pages/setting-orientation/setting-orientation.module').then(m => m.SettingOrientationPageModule)
  },
  {
    path: 'setting-qr',
    loadChildren: () => import('./pages/setting-qr/setting-qr.module').then(m => m.SettingQrPageModule)
  },
  {
    path: 'setting-auto-brightness',
    loadChildren: () => import('./pages/setting-auto-brightness/setting-auto-brightness.module').then(m => m.SettingAutoBrightnessPageModule)
  },
  {
    path: 'setting-auto-open-url',
    loadChildren: () => import('./pages/setting-auto-open-url/setting-auto-open-url.module').then(m => m.SettingAutoOpenUrlPageModule)
  },
  {
    path: 'setting-start-page',
    loadChildren: () => import('./pages/setting-start-page/setting-start-page.module').then(m => m.SettingStartPagePageModule)
  },
  {
    path: 'setting-result',
    loadChildren: () => import('./pages/setting-result/setting-result.module').then( m => m.SettingResultPageModule)
  },
  {
    path: 'setting-result-buttons',
    loadChildren: () => import('./pages/setting-result-buttons/setting-result-buttons.module').then( m => m.SettingResultButtonsPageModule)
  },
  {
    path: 'setting-auto-qr',
    loadChildren: () => import('./pages/setting-auto-qr/setting-auto-qr.module').then( m => m.SettingAutoQrPageModule)
  },
  {
    path: 'setting-auto-exit',
    loadChildren: () => import('./pages/setting-auto-exit/setting-auto-exit.module').then( m => m.SettingAutoExitPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: CustomPreloadingStrategyService })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
