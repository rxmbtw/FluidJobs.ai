const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  try {
    console.log('Running Modular Resume Structure migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', '008_create_modular_resume_structure.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Modular Resume Structure migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - resume_forms');
    console.log('  - basic_details');
    console.log('  - contact_details');
    console.log('  - phone_numbers');
    console.log('  - emails');
    console.log('  - web_links');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
