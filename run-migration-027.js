const { Pool } = require('pg');

const pool = new Pool({
  host: '72.60.103.151',
  port: 5432,
  user: 'fluidadmin',
  password: 'admin123',
  database: 'fluiddb'
});

const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('\n🚀 Running Migration 027: User-Level Custom Permissions\n');
  console.log('='.repeat(60));

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'database/migrations/027_user_permissions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📄 Executing migration SQL...');
    await pool.query(migrationSQL);
    console.log('✅ Migration executed successfully!');

    // Verify table creation
    console.log('\n🔍 Verifying table creation...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_permissions'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ user_permissions table created');
    } else {
      console.log('❌ user_permissions table NOT created');
    }

    // Verify view creation
    const viewCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_name = 'user_effective_permissions'
      );
    `);

    if (viewCheck.rows[0].exists) {
      console.log('✅ user_effective_permissions view created');
    } else {
      console.log('❌ user_effective_permissions view NOT created');
    }

    // Test the function
    console.log('\n🧪 Testing user_has_permission function...');
    const testResult = await pool.query(`
      SELECT user_has_permission(1, 'view_jobs') as has_permission;
    `);
    console.log(`✅ Function works! Test result: ${testResult.rows[0].has_permission}`);

    // Show example of effective permissions
    console.log('\n📊 Sample Effective Permissions (first user):');
    const samplePerms = await pool.query(`
      SELECT user_name, role, permission_name, has_permission, permission_source
      FROM user_effective_permissions
      WHERE user_id = 1 AND has_permission = true
      LIMIT 10;
    `);

    console.log('\nUser:', samplePerms.rows[0]?.user_name || 'N/A');
    console.log('Role:', samplePerms.rows[0]?.role || 'N/A');
    console.log('\nPermissions:');
    samplePerms.rows.forEach(row => {
      console.log(`  - ${row.permission_name} (${row.permission_source})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration 027 completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

runMigration();
