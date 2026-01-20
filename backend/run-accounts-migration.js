const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fluidjobs',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function runAccountsMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running accounts table migration...');
    
    // Read and execute the migration file
    const migrationPath = path.join(__dirname, 'migrations', '014_create_accounts_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    console.log('✅ Accounts table migration completed successfully');
    
    // Verify tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'account_users', 'jobs_enhanced', 'superadmins', 'audit_logs', 'ai_policies')
      ORDER BY table_name
    `);
    
    console.log('📋 Verified tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runAccountsMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });