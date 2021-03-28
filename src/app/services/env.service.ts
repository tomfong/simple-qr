import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  private _scannedData: string = '';

  constructor(
    private file: File,
    private platform: Platform
  ) { }

  get result(): string {
    return this._scannedData;
  }

  set result(value: string) {
    this._scannedData = value;
  }

  get baseDir(): string {
    let baseDir: string;
    if (this.platform.is('android')) {
      baseDir = this.file.externalDataDirectory;
    } else {
      baseDir = this.file.dataDirectory;
    }
    return baseDir;
  }
}
