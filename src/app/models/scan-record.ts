export class ScanRecord {
    id!: string;
    text!: string;
    createdAt!: Date;
    source: 'create' | 'view' | 'scan' | 'external-share' | undefined;
    barcodeType: string | undefined;
}