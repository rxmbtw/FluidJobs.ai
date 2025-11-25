const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

async function correctImport() {
  try {
    console.log('🚀 Starting corrected import...');
    
    // Download CSV
    const bucketName = 'fluidjobai';
    const fileName = 'FL_candidates_data - FL_candidates_data.csv (9).csv';
    const localFilePath = path.join(__dirname, 'correct_temp.csv');
    
    console.log('📥 Downloading CSV...');
    await storage.bucket(bucketName).file(fileName).download({
      destination: localFilePath,
    });

    // Read CSV as raw text and split by lines
    const csvContent = fs.readFileSync(localFilePath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`📋 Found ${lines.length} lines in CSV`);
    
    let processedCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      try {
        // Split by comma (handling quoted fields)
        const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
        
        if (columns.length < 15 || !columns[1] || !columns[3]) {
          continue; // Skip invalid rows
        }

        // Generate a simple candidate_id
        const candidateId = `FLC${String(processedCount + 1).padStart(10, '0')}`;

        await pool.query(`
          INSERT INTO candidates (
            candidate_id, full_name, phone_number, email, gender, marital_status,
            current_company, notice_period, current_ctc, location,
            resume_link, currently_employed, previous_company,
            expected_ctc, experience_years
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          candidateId,           // candidate_id (generated)
          columns[1] || null,    // full_name
          columns[2] || null,    // phone_number  
          columns[3] || null,    // email
          columns[4] || null,    // gender
          columns[5] || null,    // marital_status
          columns[6] || null,    // current_company
          columns[7] || null,    // notice_period
          parseFloat(columns[8]) || null,  // current_ctc
          columns[9] || null,    // location
          columns[10] || null,   // resume_link
          columns[11] || null,   // currently_employed
          columns[12] || null,   // previous_company
          parseFloat(columns[13]) || null, // expected_ctc
          parseFloat(columns[14]) || null  // experience_years
        ]);

        processedCount++;
        if (processedCount % 100 === 0) {
          console.log(`✅ Processed ${processedCount} candidates...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error importing row ${processedCount + errorCount}:`, error.message);
      }
    }

    fs.unlinkSync(localFilePath);
    
    console.log('\n🎉 Import completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Successfully imported: ${processedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
    // Verify specific candidate
    console.log('\n🔍 Checking for Aaradhya Agrawal...');
    const checkResult = await pool.query(`
      SELECT candidate_id, full_name, email 
      FROM candidates 
      WHERE full_name ILIKE '%Aaradhya%Agrawal%'
    `);
    
    if (checkResult.rows.length > 0) {
      checkResult.rows.forEach(row => {
        console.log(`✅ Found: ${row.candidate_id} - ${row.full_name} - ${row.email}`);
      });
    } else {
      console.log('❌ Aaradhya Agrawal not found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('💥 Error:', error.message);
    await pool.end();
  }
}

correctImport();