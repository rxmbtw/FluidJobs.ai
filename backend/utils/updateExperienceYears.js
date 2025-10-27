const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function updateExperienceYears() {
  try {
    console.log('🔄 Starting experience_years update...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../FluidJobs.ai/public/FL_candidates_data - FL_candidates_data.csv (9).csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV data
    const lines = csvData.split('\r\n').filter(line => line.trim());
    console.log(`📊 Found ${lines.length} candidate records`);
    
    let updated = 0;
    let errors = 0;
    
    for (let i = 0; i < lines.length; i++) {
      try {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const fields = line.split(',');
        
        // Skip if not enough fields or if it's a header-like line
        if (fields.length < 10 || fields[0].startsWith('FLC') === false) {
          continue;
        }
        
        const email = fields[3]?.trim();
        const experienceYears = fields[14] && !isNaN(parseFloat(fields[14])) ? parseFloat(fields[14]) : null;
        
        if (!email || experienceYears === null) {
          continue;
        }
        
        // Update the candidate's experience_years
        const updateQuery = `
          UPDATE candidates 
          SET experience_years = $1, updated_at = CURRENT_TIMESTAMP
          WHERE email = $2
        `;
        
        const result = await pool.query(updateQuery, [experienceYears, email]);
        
        if (result.rowCount > 0) {
          updated++;
          
          if (updated % 50 === 0) {
            console.log(`✅ Updated ${updated} candidates...`);
          }
        }
        
      } catch (error) {
        errors++;
        console.error(`❌ Error updating candidate on line ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`🎉 Update completed!`);
    console.log(`✅ Successfully updated: ${updated} candidates`);
    console.log(`❌ Errors: ${errors}`);
    
    // Verify the update
    const verifyQuery = `
      SELECT 
        COUNT(*) as total_candidates,
        COUNT(experience_years) as candidates_with_experience,
        AVG(experience_years) as avg_experience,
        MIN(experience_years) as min_experience,
        MAX(experience_years) as max_experience
      FROM candidates
    `;
    
    const verifyResult = await pool.query(verifyQuery);
    const stats = verifyResult.rows[0];
    
    console.log(`\n📊 Database Statistics:`);
    console.log(`Total candidates: ${stats.total_candidates}`);
    console.log(`Candidates with experience data: ${stats.candidates_with_experience}`);
    console.log(`Average experience: ${parseFloat(stats.avg_experience).toFixed(2)} years`);
    console.log(`Experience range: ${stats.min_experience} - ${stats.max_experience} years`);
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    throw error;
  }
}

module.exports = { updateExperienceYears };

// Run if called directly
if (require.main === module) {
  updateExperienceYears()
    .then(() => {
      console.log('✅ Update script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Update script failed:', error);
      process.exit(1);
    });
}