import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public language: string = 'en';
  public darkTheme: boolean = false;

  constructor(

  ) { 
    
  }
}
