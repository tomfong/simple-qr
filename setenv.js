const fs = require('fs');
require('dotenv').config()

const environmentFile = `export const environment = {
    production: false,
    storageScanRecordKey: "${process.env.STORAGE_SCAN_RECORD_KEY}",
    storageBookmarkKey: "${process.env.STORAGE_BOOKMARK_KEY}",
    classicMilkTeaPK: "${process.env.CLASSIC_MILKTEA_PK}",
    pearlMilkTeaPK: "${process.env.PEARL_MILKTEA_PK}",
    fancyMilkTeaPK: "${process.env.FANCY_MILKTEA_PK}",
    premiumMilkTeaPK: "${process.env.PREMIUM_MILKTEA_PK}",
    paypalDonateUrl: "${process.env.PAYPAL_DONATE_URL}"
};
`;

const environmentProdFile = `export const environment = {
    production: true,
    storageScanRecordKey: "${process.env.STORAGE_SCAN_RECORD_KEY}",
    storageBookmarkKey: "${process.env.STORAGE_BOOKMARK_KEY}",
    classicMilkTeaPK: "${process.env.CLASSIC_MILKTEA_PK}",
    pearlMilkTeaPK: "${process.env.PEARL_MILKTEA_PK}",
    fancyMilkTeaPK: "${process.env.FANCY_MILKTEA_PK}",
    premiumMilkTeaPK: "${process.env.PREMIUM_MILKTEA_PK}",
    paypalDonateUrl: "${process.env.PAYPAL_DONATE_URL}"
};
`;
const dir = './src/environments';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
}

fs.writeFile('./src/environments/environment.ts', environmentFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(`Angular environment.ts file generated`);
    }
});

fs.writeFile('./src/environments/environment.prod.ts', environmentProdFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(`Angular environment.prod.ts file generated`);
    }
});