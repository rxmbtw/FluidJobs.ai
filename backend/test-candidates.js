const pool = require('./config/database');

async function testCandidates() {
  try {
    console.log('🔍 Testing candidate data...');
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    console.log(`📊 Total candidates: ${countResult.rows[0].count}`);
    
    // Get first 5 candidates
    const candidatesResult = await pool.query(`
      SELECT 
        candidate_id,
        full_name,
        email,
        current_company,
        location,
        experience_years,
        current_ctc
      FROM candidates 
      ORDER BY candidate_id 
      LIMIT 5
    `);
    
    console.log('\n👥 Sample candidates:');
    candidatesResult.rows.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.full_name} (${candidate.email})`);
      console.log(`   Company: ${candidate.current_company || 'N/A'}`);
      console.log(`   Location: ${candidate.location || 'N/A'}`);
      console.log(`   Experience: ${candidate.experience_years || 0} years`);
      console.log(`   CTC: ${candidate.current_ctc || 'N/A'}`);
      console.log('');
    });
    
    // Get statistics
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as employed FROM candidates WHERE currently_employed = \'Yes\''),
      pool.query('SELECT COUNT(*) as fresher FROM candidates WHERE currently_employed = \'Fresher\''),
      pool.query('SELECT AVG(experience_years) as avg_experience FROM candidates WHERE experience_years > 0'),
      pool.query(`
        SELECT location, COUNT(*) as count 
        FROM candidates 
        WHERE location IS NOT NULL AND location != ''
        GROUP BY location 
        ORDER BY count DESC 
        LIMIT 5
      `)
    ]);
    
    console.log('📈 Statistics:');
    console.log(`   Employed: ${stats[0].rows[0].employed}`);
    console.log(`   Freshers: ${stats[1].rows[0].fresher}`);
    console.log(`   Average Experience: ${parseFloat(stats[2].rows[0].avg_experience || 0).toFixed(1)} years`);
    console.log('\n🏙️ Top Locations:');
    stats[3].rows.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.location}: ${loc.count} candidates`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testCandidates();