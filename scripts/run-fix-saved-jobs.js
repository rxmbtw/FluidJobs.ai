const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '013_fix_saved_jobs_for_candidates.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    process.exit();
  }
}

runMigration();
