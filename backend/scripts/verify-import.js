const { Storage } = require('@google-cloud/storage');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

async function verifyImport() {
  try {
    // Download and check first few rows of CSV
    console.log('📥 Downloading CSV to verify...');
    const bucketName = 'fluidjobai';
    const fileName = 'FL_candidates_data - FL_candidates_data.csv (9).csv';
    const localFilePath = path.join(__dirname, 'verify_temp.csv');
    
    await storage.bucket(bucketName).file(fileName).download({
      destination: localFilePath,
    });

    console.log('📊 First 3 rows from CSV:');
    let csvCount = 0;
    const csvData = [];
    
    fs.createReadStream(localFilePath)
      .pipe(csv({
        headers: ['candidate_id', 'full_name', 'phone_number', 'email', 'gender', 'marital_status', 'current_company', 'notice_period', 'current_ctc', 'location', 'resume_link', 'currently_employed', 'previous_company', 'expected_ctc', 'experience_years']
      }))
      .on('data', (data) => {
        if (csvCount < 3) {
          console.log(`CSV Row ${csvCount + 1}:`);
          console.log(`  Name: ${data.full_name}`);
          console.log(`  Email: ${data.email}`);
          console.log(`  Phone: ${data.phone_number}`);
          console.log('');
          csvData.push(data);
        }
        csvCount++;
      })
      .on('end', async () => {
        console.log(`📋 Total CSV rows: ${csvCount}`);
        
        // Check database
        console.log('\n📊 First 3 rows from Database:');
        const dbResult = await pool.query('SELECT full_name, email, phone_number FROM candidates ORDER BY created_at LIMIT 3');
        
        dbResult.rows.forEach((row, index) => {
          console.log(`DB Row ${index + 1}:`);
          console.log(`  Name: ${row.full_name}`);
          console.log(`  Email: ${row.email}`);
          console.log(`  Phone: ${row.phone_number}`);
          console.log('');
        });

        // Compare
        console.log('🔍 Comparison:');
        for (let i = 0; i < Math.min(3, csvData.length, dbResult.rows.length); i++) {
          const csvRow = csvData[i];
          const dbRow = dbResult.rows[i];
          
          console.log(`Row ${i + 1} Match:`);
          console.log(`  Name: ${csvRow.full_name === dbRow.full_name ? '✅' : '❌'} (CSV: "${csvRow.full_name}" | DB: "${dbRow.full_name}")`);
          console.log(`  Email: ${csvRow.email === dbRow.email ? '✅' : '❌'} (CSV: "${csvRow.email}" | DB: "${dbRow.email}")`);
          console.log(`  Phone: ${csvRow.phone_number === dbRow.phone_number ? '✅' : '❌'} (CSV: "${csvRow.phone_number}" | DB: "${dbRow.phone_number}")`);
          console.log('');
        }

        fs.unlinkSync(localFilePath);
        await pool.end();
      });
      
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyImport();