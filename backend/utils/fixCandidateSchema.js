const pool = require('../config/database');

async function fixCandidateSchema() {
  try {
    console.log('🔄 Fixing candidate schema...');
    
    // Drop existing table and recreate with VARCHAR candidate_id
    await pool.query('DROP TABLE IF EXISTS candidates CASCADE');
    
    // Recreate candidates table with VARCHAR candidate_id
    await pool.query(`
      CREATE TABLE candidates (
        candidate_id VARCHAR(20) PRIMARY KEY,
        full_name VARCHAR(100),
        phone_number VARCHAR(20),
        email VARCHAR(100) UNIQUE NOT NULL,
        gender VARCHAR(10),
        marital_status VARCHAR(20),
        current_company VARCHAR(100),
        notice_period VARCHAR(50),
        current_ctc NUMERIC(12,2),
        location VARCHAR(100),
        resume_link TEXT,
        currently_employed VARCHAR(10),
        previous_company VARCHAR(100),
        expected_ctc NUMERIC(12,2),
        experience_years NUMERIC(4,1),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email)');
    
    // Create trigger for updated_at
    await pool.query(`
      CREATE TRIGGER update_candidates_updated_at 
      BEFORE UPDATE ON candidates 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('✅ Candidate schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    throw error;
  }
}

module.exports = { fixCandidateSchema };

// Run if called directly
if (require.main === module) {
  fixCandidateSchema()
    .then(() => {
      console.log('✅ Schema fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema fix failed:', error);
      process.exit(1);
    });
}