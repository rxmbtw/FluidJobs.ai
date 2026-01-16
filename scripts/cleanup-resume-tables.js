const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanupTables() {
  try {
    console.log('🗑️  Cleaning up existing resume form tables...\n');
    console.log('⚠️  WARNING: This will DELETE ALL DATA in resume form tables!\n');
    
    // Drop tables in reverse order (child tables first due to foreign keys)
    const tablesToDrop = [
      'phone_numbers',
      'emails',
      'web_links',
      'education',
      'attachments',
      'family_details',
      'professional_experience',
      'internships',
      'projects',
      'publications',
      'seminars_trainings',
      'certifications',
      'positions_of_responsibility',
      'other_details',
      'candidate_references',
      'placement_policy',
      'contact_details',
      'basic_details',
      'resume_forms'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop ${table}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Cleanup completed!');
    console.log('📋 Next step: Run "node run-all-resume-migrations.js" to create fresh tables');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupTables();
