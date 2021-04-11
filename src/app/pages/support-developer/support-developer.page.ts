import { Component } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-support-developer',
  templateUrl: './support-developer.page.html',
  styleUrls: ['./support-developer.page.scss'],
})
export class SupportDeveloperPage {

  constructor(
    public env: EnvService,
  ) { }


}
