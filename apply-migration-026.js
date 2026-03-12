const path = require('path');
const fs = require('fs');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/database');

async function applyMigration() {
  try {
    console.log('📝 Applying migration 026: Job Edit Requests...\n');

    const sql = fs.readFileSync('./database/migrations/026_job_edit_requests.sql', 'utf8');
    await pool.query(sql);

    console.log('✅ Migration 026 applied successfully!');
    console.log('   - job_edit_requests table created');
    console.log('   - Indexes created');
    console.log('   - Ready for edit approval workflow\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
