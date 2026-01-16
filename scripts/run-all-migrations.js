const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running all migrations...\n');
    
    // Run job applications migration
    console.log('1️⃣ Creating job_applications table...');
    const migration1 = path.join(__dirname, 'migrations', '010_job_applications.sql');
    const sql1 = fs.readFileSync(migration1, 'utf8');
    await pool.query(sql1);
    console.log('✅ Job applications table created\n');
    
    // Run saved jobs migration (also fixes candidate_id)
    console.log('2️⃣ Creating saved_jobs table and fixing candidate_id...');
    const migration2 = path.join(__dirname, 'migrations', '012_create_saved_jobs.sql');
    const sql2 = fs.readFileSync(migration2, 'utf8');
    await pool.query(sql2);
    console.log('✅ Saved jobs table created and candidate_id fixed\n');
    
    console.log('🎉 All migrations completed successfully!');
    console.log('👉 Now restart your backend server with: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
