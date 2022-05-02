export class ScanRecord {
    id: string;
    text: string;
    createdAt: Date;
    source: 'create' | 'view' | 'scan' | undefined;
    barcodeType: string | undefined;
}