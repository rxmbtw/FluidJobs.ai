const { Storage } = require('@google-cloud/storage');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

const bucketName = 'fluidjobai';
const fileName = 'FL_candidates_data - FL_candidates_data.csv (9).csv';
const localFilePath = path.join(__dirname, 'temp_examine.csv');

async function examineCSV() {
  try {
    console.log('📥 Downloading CSV...');
    await storage.bucket(bucketName).file(fileName).download({
      destination: localFilePath,
    });
    
    console.log('📊 Examining CSV structure...');
    let rowCount = 0;
    let headers = null;
    
    fs.createReadStream(localFilePath)
      .pipe(csv())
      .on('headers', (headerList) => {
        headers = headerList;
        console.log('📋 CSV Headers:', headers);
      })
      .on('data', (data) => {
        if (rowCount < 3) {
          console.log(`Row ${rowCount + 1}:`, data);
        }
        rowCount++;
      })
      .on('end', () => {
        console.log(`\n📊 Total rows: ${rowCount}`);
        fs.unlinkSync(localFilePath);
      });
      
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

examineCSV();