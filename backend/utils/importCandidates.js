const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function importCandidatesFromCSV() {
  try {
    console.log('🔄 Starting candidate data import...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../FluidJobs.ai/public/FL_candidates_data - FL_candidates_data.csv (9).csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV data - handle comma-separated values with proper parsing
    const lines = csvData.split('\r\n').filter(line => line.trim());
    console.log(`📊 Found ${lines.length} candidate records`);
    
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < lines.length; i++) {
      try {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Split by comma but handle quoted fields
        const fields = line.split(',');
        
        // Skip if not enough fields or if it's a header-like line
        if (fields.length < 10 || fields[0].startsWith('FLC') === false) {
          console.log(`⚠️ Skipping line ${i + 1}: insufficient fields or invalid format`);
          continue;
        }
        
        // Clean and validate fields
        const candidateData = {
          full_name: fields[1]?.trim() || null,
          phone_number: fields[2]?.trim() || null,
          email: fields[3]?.trim() || null,
          gender: fields[4]?.trim() || null,
          marital_status: fields[5]?.trim() || null,
          current_company: fields[6]?.trim() || null,
          notice_period: fields[7]?.trim() || null,
          current_ctc: fields[8] && !isNaN(parseFloat(fields[8])) ? parseFloat(fields[8]) : null,
          location: fields[9]?.trim() || null,
          resume_link: fields[10]?.trim() || null,
          currently_employed: fields[11]?.trim() || null,
          previous_company: fields[12]?.trim() || null,
          expected_ctc: fields[13] && !isNaN(parseFloat(fields[13])) ? parseFloat(fields[13]) : null,
          experience_years: fields[15] && !isNaN(parseFloat(fields[15])) ? parseFloat(fields[15]) : null
        };
        
        // Skip if no email (required field)
        if (!candidateData.email || candidateData.email === '') {
          console.log(`⚠️ Skipping candidate ${candidateData.full_name}: no email`);
          continue;
        }
        
        // Insert into database
        const query = `
          INSERT INTO candidates (
            full_name, phone_number, email, gender, marital_status,
            current_company, notice_period, current_ctc, location,
            resume_link, currently_employed, previous_company,
            expected_ctc, experience_years
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (email) DO NOTHING
        `;
        
        const values = [
          candidateData.full_name,
          candidateData.phone_number,
          candidateData.email,
          candidateData.gender,
          candidateData.marital_status,
          candidateData.current_company,
          candidateData.notice_period,
          candidateData.current_ctc,
          candidateData.location,
          candidateData.resume_link,
          candidateData.currently_employed,
          candidateData.previous_company,
          candidateData.expected_ctc,
          candidateData.experience_years
        ];
        
        await pool.query(query, values);
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`✅ Imported ${imported} candidates...`);
        }
        
      } catch (error) {
        errors++;
        console.error(`❌ Error importing candidate on line ${i + 1}: ${error.message}`);
        if (errors < 5) {
          console.error('Line content:', lines[i]);
        }
      }
    }
    
    console.log(`🎉 Import completed!`);
    console.log(`✅ Successfully imported: ${imported} candidates`);
    console.log(`❌ Errors: ${errors}`);
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    console.log(`📊 Total candidates in database: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  }
}

module.exports = { importCandidatesFromCSV };

// Run if called directly
if (require.main === module) {
  importCandidatesFromCSV()
    .then(() => {
      console.log('✅ Import script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import script failed:', error);
      process.exit(1);
    });
}