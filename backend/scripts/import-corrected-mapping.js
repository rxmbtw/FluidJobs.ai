const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('../config/database');

async function importWithCorrectMapping() {
  try {
    console.log('🗑️ Clearing existing candidates...');
    await pool.query('DELETE FROM candidates');
    
    console.log('📥 Importing with correct column mapping...');
    
    const csvPath = path.join(__dirname, '../OriginalCandidates.csv');
    const results = [];
    
    // Read CSV with proper headers
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`📋 Found ${results.length} records`);
        
        let processedCount = 0;
        let errorCount = 0;
        
        for (const row of results) {
          try {
            // Clean salary values (remove ₹ and commas)
            const cleanSalary = (salary) => {
              if (!salary) return null;
              const cleaned = salary.replace(/[₹,]/g, '').trim();
              return parseFloat(cleaned) || null;
            };
            
            await pool.query(`
              INSERT INTO candidates (
                candidate_id, full_name, phone_number, email, gender, marital_status,
                current_company, notice_period, current_ctc, location, resume_link,
                currently_employed, previous_company, experience_years
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
              row['Candidate_id'] || null,
              row['Candidate Name'] || null,
              row['Mobile'] || null,
              row['Email'] || null,
              row['Gender'] || null,
              row['Marital Satus'] || null,  // Note: CSV has typo "Satus"
              row['Current Company'] || null,
              row['Notice Period'] || null,
              cleanSalary(row['Current Salary']),
              row['Current City'] || null,
              row['Download CV'] || null,
              row['Working?'] || null,
              row['Last Company'] || null,
              parseFloat(row['Total Exp']) || null
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
        const result = await pool.query(`
          SELECT candidate_id, full_name, email, location, notice_period, current_ctc 
          FROM candidates 
          ORDER BY candidate_id 
          LIMIT 5
        `);
        
        result.rows.forEach(row => {
          console.log(`${row.candidate_id} - ${row.full_name}`);
          console.log(`  Email: ${row.email}`);
          console.log(`  Location: ${row.location}`);
          console.log(`  Notice: ${row.notice_period}`);
          console.log(`  CTC: ${row.current_ctc}`);
          console.log('');
        });
        
        await pool.end();
      });
      
  } catch (error) {
    console.error('💥 Error:', error.message);
    await pool.end();
  }
}

importWithCorrectMapping();