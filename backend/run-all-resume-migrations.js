const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runAllMigrations() {
  try {
    console.log('🚀 Running ALL Resume Form Migrations...\n');
    
    // Migration 1: Modular structure (basic_details, contact_details, etc.)
    console.log('📋 Step 1: Creating modular resume structure...');
    const migration1Path = path.join(__dirname, 'migrations', '008_create_modular_resume_structure.sql');
    const migration1SQL = fs.readFileSync(migration1Path, 'utf8');
    await pool.query(migration1SQL);
    console.log('✅ Modular structure created\n');
    
    // Migration 2: Remaining sections
    console.log('📋 Step 2: Creating remaining resume sections...');
    const migration2Path = path.join(__dirname, 'migrations', '009_create_remaining_resume_sections.sql');
    const migration2SQL = fs.readFileSync(migration2Path, 'utf8');
    await pool.query(migration2SQL);
    console.log('✅ Remaining sections created\n');
    
    console.log('🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!\n');
    console.log('📊 Created Tables:');
    console.log('  ✓ resume_forms (Main table)');
    console.log('  ✓ basic_details');
    console.log('  ✓ contact_details (includes phones, emails, web_links as JSONB)');
    console.log('  ✓ education');
    console.log('  ✓ attachments');
    console.log('  ✓ family_details');
    console.log('  ✓ professional_experience');
    console.log('  ✓ internships');
    console.log('  ✓ projects');
    console.log('  ✓ publications');
    console.log('  ✓ seminars_trainings');
    console.log('  ✓ certifications');
    console.log('  ✓ positions_of_responsibility');
    console.log('  ✓ other_details');
    console.log('  ✓ candidate_references');
    console.log('  ✓ placement_policy');
    console.log('\n📝 Total: 16 tables created for modular resume management');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

runAllMigrations();
