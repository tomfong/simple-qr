import { Component, Input } from '@angular/core';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss'],
})
export class QrcodeComponent {

  @Input() qrCodeContent: string;
  qrElementType: NgxQrcodeElementTypes = NgxQrcodeElementTypes.CANVAS;
  errorCorrectionLevel: NgxQrcodeErrorCorrectionLevels = NgxQrcodeErrorCorrectionLevels.LOW;
  qrMargin: number = 3;

  constructor() { }

  
  get qrColorDark(): string {
    return "#222428";
  }

  get qrColorLight(): string {
    return "#ffffff";
  }

}
