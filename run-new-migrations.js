const path = require('path');
const fs = require('fs');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/database');

async function runMigrations() {
  try {
    console.log('🔄 Running new database migrations...\n');

    const migrations = [
      { file: '022_add_job_status_fields.sql', name: 'Job Status Fields' },
      { file: '023_fix_superadmin_fkeys.sql', name: 'SuperAdmin Foreign Keys' },
      { file: '024_create_job_cover_images.sql', name: 'Job Cover Images' },
      { file: '025_interviewer_assignments.sql', name: 'Interviewer Assignments' }
    ];

    for (const migration of migrations) {
      console.log(`📝 Running: ${migration.name} (${migration.file})`);
      
      const migrationPath = path.join(__dirname, 'database', 'migrations', migration.file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✅ ${migration.name} completed\n`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⏭️  ${migration.name} already applied\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigrations();
