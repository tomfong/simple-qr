import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MenuItem } from 'src/app/models/menu-item';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {

  @Input() menuItems: MenuItem[];

  constructor(
    private popoverController: PopoverController,
  ) { }

  onPress(action: string) {
    this.popoverController.dismiss({ action });
  }
}
