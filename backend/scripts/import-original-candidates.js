const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function importOriginalCandidates() {
  try {
    const csvPath = path.join(__dirname, '../OriginalCandidates.csv');
    
    console.log('📋 Reading CSV file...');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log(`Found ${lines.length} lines in CSV`);
    
    console.log('🗑️ Clearing existing candidates...');
    await pool.query('DELETE FROM candidates');
    
    console.log('📥 Importing candidates...');
    let processedCount = 0;
    let errorCount = 0;
    
    for (const line of lines) {
      try {
        const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
        
        if (columns.length < 15 || !columns[0] || !columns[1] || !columns[3]) {
          continue;
        }
        
        await pool.query(`
          INSERT INTO candidates (
            candidate_id, full_name, phone_number, email, gender, marital_status,
            current_company, notice_period, current_ctc, location, resume_link,
            currently_employed, experience_years
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          columns[0],  // candidate_id
          columns[1],  // full_name
          columns[2],  // phone_number
          columns[3],  // email
          columns[4],  // gender
          columns[5],  // marital_status
          columns[6],  // current_company
          columns[7],  // notice_period
          parseFloat(columns[8]) || null,  // current_ctc
          columns[9],  // location
          columns[10], // resume_link
          columns[11], // currently_employed
          parseFloat(columns[12]) || null   // experience_years
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
    
    console.log('\n🎉 Import completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Successfully imported: ${processedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
    // Verify first few records
    console.log('\n🔍 Verification (first 5 records):');
    const result = await pool.query('SELECT candidate_id, full_name, email FROM candidates ORDER BY candidate_id LIMIT 5');
    result.rows.forEach(row => {
      console.log(`${row.candidate_id} - ${row.full_name} - ${row.email}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('💥 Error:', error.message);
    await pool.end();
  }
}

importOriginalCandidates();