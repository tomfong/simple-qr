const fs = require('fs');
require('dotenv').config()

const environmentFile = `export const environment = {
    production: false,
    storageScanRecordKey: "${process.env.STORAGE_SCAN_RECORD_KEY}"
};
`;

const environmentProdFile = `export const environment = {
    production: true,
    storageScanRecordKey: "${process.env.STORAGE_SCAN_RECORD_KEY}"
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