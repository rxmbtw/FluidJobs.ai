const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

async function fixCandidatesTable() {
  try {
    console.log('🔧 Fixing candidates table...');
    
    // Add primary key constraint if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'candidates' AND constraint_type = 'PRIMARY KEY'
        ) THEN
          ALTER TABLE candidates ADD PRIMARY KEY (candidate_id);
        END IF;
      END $$;
    `);
    
    console.log('✅ Candidates table fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixCandidatesTable();