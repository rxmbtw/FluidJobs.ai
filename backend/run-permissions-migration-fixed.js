const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

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
    
    console.log('\n🎉 Permissions migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
runPermissionsMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });