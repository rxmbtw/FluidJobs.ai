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

const bucketName = 'fluidjobai';
const fileName = 'FL_candidates_data - FL_candidates_data.csv (9).csv';
const localFilePath = path.join(__dirname, 'temp_candidates.csv');

async function downloadCSV() {
  try {
    console.log('📥 Downloading CSV from Google Cloud Storage...');
    await storage.bucket(bucketName).file(fileName).download({
      destination: localFilePath,
    });
    console.log('✅ CSV downloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error downloading CSV:', error.message);
    return false;
  }
}

async function backupExistingCandidates() {
  try {
    console.log('💾 Creating backup of existing candidates...');
    const result = await pool.query('SELECT * FROM candidates');
    const backupData = JSON.stringify(result.rows, null, 2);
    const backupPath = path.join(__dirname, `candidates_backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, backupData);
    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    throw error;
  }
}

async function clearCandidatesTable() {
  try {
    console.log('🗑️ Clearing existing candidates...');
    await pool.query('DELETE FROM candidates');
    console.log('✅ Candidates table cleared');
  } catch (error) {
    console.error('❌ Error clearing candidates:', error.message);
    throw error;
  }
}

async function importCandidatesFromCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    let processedCount = 0;
    let errorCount = 0;
    let isFirstRow = true;

    console.log('📊 Reading and importing CSV data...');

    fs.createReadStream(localFilePath)
      .pipe(csv({
        headers: ['candidate_id', 'full_name', 'phone_number', 'email', 'gender', 'marital_status', 'current_company', 'notice_period', 'current_ctc', 'location', 'resume_link', 'currently_employed', 'previous_company', 'expected_ctc', 'experience_years']
      }))
      .on('data', (data) => {
        // Include the first row as it contains actual data
        results.push(data);
      })
      .on('end', async () => {
        console.log(`📋 Found ${results.length} records in CSV`);

        for (const row of results) {
          try {
            // Map CSV columns to database columns
            const candidateData = {
              candidate_id: row.candidate_id || '',
              full_name: row.full_name || '',
              phone_number: row.phone_number || '',
              email: row.email || '',
              gender: row.gender || null,
              marital_status: row.marital_status || null,
              current_company: row.current_company || '',
              notice_period: row.notice_period || null,
              current_ctc: parseFloat(row.current_ctc) || null,
              location: row.location || '',
              resume_link: row.resume_link || null,
              currently_employed: row.currently_employed || null,
              previous_company: row.previous_company || null,
              expected_ctc: parseFloat(row.expected_ctc) || null,
              experience_years: parseFloat(row.experience_years) || null
            };

            // Skip empty rows
            if (!candidateData.candidate_id || !candidateData.full_name) {
              continue;
            }

            await pool.query(`
              INSERT INTO candidates (
                candidate_id, full_name, phone_number, email, gender, marital_status,
                current_company, notice_period, current_ctc, location,
                resume_link, currently_employed, previous_company,
                expected_ctc, experience_years
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
              candidateData.candidate_id,
              candidateData.full_name || null,
              candidateData.phone_number || null,
              candidateData.email || null,
              candidateData.gender || null,
              candidateData.marital_status || null,
              candidateData.current_company || null,
              candidateData.notice_period || null,
              candidateData.current_ctc || null,
              candidateData.location || null,
              candidateData.resume_link || null,
              candidateData.currently_employed || null,
              candidateData.previous_company || null,
              candidateData.expected_ctc || null,
              candidateData.experience_years || null
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

        // Clean up temp file
        fs.unlinkSync(localFilePath);

        resolve({
          total: results.length,
          processed: processedCount,
          errors: errorCount
        });
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    console.log('🚀 Starting candidate replacement process...');
    
    // Step 1: Download CSV
    const downloadSuccess = await downloadCSV();
    if (!downloadSuccess) {
      throw new Error('Failed to download CSV file');
    }

    // Step 2: Create backup
    const backupPath = await backupExistingCandidates();

    // Step 3: Clear existing data
    await clearCandidatesTable();

    // Step 4: Import new data
    const importResult = await importCandidatesFromCSV();

    console.log('\n🎉 Candidate replacement completed successfully!');
    console.log(`📊 Import Summary:`);
    console.log(`   - Total records in CSV: ${importResult.total}`);
    console.log(`   - Successfully imported: ${importResult.processed}`);
    console.log(`   - Errors: ${importResult.errors}`);
    console.log(`💾 Backup saved to: ${backupPath}`);

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main();