const { Pool } = require('pg');
require('dotenv').config();

const gcp = new Pool({
  host: '34.14.144.201',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Fluidjobsaidb@01',
  ssl: { rejectUnauthorized: false }
});

const vps = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function createMissingTables() {
  console.log('📦 Tables already created via migrations');
}

async function migrateTable(tableName, columns, whereClause = '') {
  try {
    const query = `SELECT * FROM ${tableName}${whereClause}`;
    const data = await gcp.query(query);
    if (data.rows.length === 0) {
      console.log(`  ⏭️  ${tableName}: 0 rows (skipped)`);
      return;
    }

    const cols = columns.join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    let migrated = 0;
    for (const row of data.rows) {
      try {
        const values = columns.map(col => row[col]);
        await vps.query(
          `INSERT INTO ${tableName} (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        migrated++;
      } catch (e) {
        // Skip rows with constraint violations
      }
    }
    console.log(`  ✅ ${tableName}: ${migrated}/${data.rows.length} rows migrated`);
  } catch (error) {
    console.error(`  ❌ ${tableName}: ${error.message}`);
  }
}

async function migrate() {
  try {
    console.log('🚀 Starting GCP to VPS migration...\n');

    await createMissingTables();

    console.log('\n📊 Migrating data...');
    
    await migrateTable('admin_whitelist', ['email', 'added_at']);
    await migrateTable('candidates', ['candidate_id', 'full_name', 'phone_number', 'email', 'gender', 'marital_status', 'current_company', 'notice_period', 'current_ctc', 'location', 'resume_link', 'currently_employed', 'previous_company', 'expected_ctc', 'experience_years', 'created_at', 'updated_at', 'profile_image_url', 'cover_image_url', 'work_status', 'last_company', 'previous_ctc', 'work_mode', 'user_role', 'role', 'password_hash', 'city']);

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
  } finally {
    await gcp.end();
    await vps.end();
  }
}

migrate();
