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

async function runPermissionsMigration() {
  try {
    console.log('🚀 Starting Permissions System Migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '018_create_permissions_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Permissions system created successfully!');
    
    // Verify the setup
    const permissionsCount = await pool.query('SELECT COUNT(*) FROM permissions');
    const rolePermissionsCount = await pool.query('SELECT COUNT(*) FROM role_permissions');
    
    console.log(`📊 Created ${permissionsCount.rows[0].count} permissions`);
    console.log(`📊 Created ${rolePermissionsCount.rows[0].count} role-permission mappings`);
    
    // Show role breakdown
    const roleBreakdown = await pool.query(`
      SELECT rp.role, COUNT(*) as permission_count
      FROM role_permissions rp
      GROUP BY rp.role
      ORDER BY rp.role
    `);
    
    console.log('\n📋 Role Permission Breakdown:');
    roleBreakdown.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.permission_count} permissions`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runPermissionsMigration()
    .then(() => {
      console.log('\n🎉 Permissions migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runPermissionsMigration };