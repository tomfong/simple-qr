import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public language: string = 'en';
  public darkTheme: boolean = false;

  public readonly APP_FOLDER_NAME: string = 'SimpleQR';
  public readonly WEB_SEARCH_URL: string = "https://www.google.com/search?q=";

  constructor() { }

}
