const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/database');
const bcrypt = require('bcryptjs');

async function mergeSuperadmins() {
  try {
    console.log('🔍 Checking superadmins table...\n');

    // Check if superadmins table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'superadmins'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ superadmins table does not exist');
      process.exit(1);
    }

    // Get all superadmins
    const superadmins = await pool.query('SELECT * FROM superadmins');
    
    console.log(`📊 Found ${superadmins.rows.length} superadmins to migrate\n`);

    if (superadmins.rows.length === 0) {
      console.log('✅ No superadmins to migrate');
      process.exit(0);
    }

    let migrated = 0;
    let skipped = 0;

    for (const superadmin of superadmins.rows) {
      console.log(`Processing: ${superadmin.email} (${superadmin.name})`);

      // Check if user already exists in users table
      const existingUser = await pool.query(
        'SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)',
        [superadmin.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`  ⏭️  Already exists in users table (ID: ${existingUser.rows[0].id})`);
        skipped++;
        continue;
      }

      // Insert into users table with SuperAdmin role
      const result = await pool.query(`
        INSERT INTO users (
          email, 
          name, 
          role, 
          password_hash,
          created_at
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name, role
      `, [
        superadmin.email,
        superadmin.name,
        'SuperAdmin',
        superadmin.password_hash,
        superadmin.created_at || new Date()
      ]);

      console.log(`  ✅ Migrated to users table (ID: ${result.rows[0].id}, Role: ${result.rows[0].role})`);
      migrated++;
    }

    console.log('\n📈 Migration Summary:');
    console.log(`  ✅ Migrated: ${migrated}`);
    console.log(`  ⏭️  Skipped (already exists): ${skipped}`);
    console.log(`  📊 Total processed: ${superadmins.rows.length}`);

    // Show all users now
    console.log('\n👥 All users in users table:');
    const allUsers = await pool.query('SELECT id, email, name, role FROM users ORDER BY role, email');
    allUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`);
    });

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

mergeSuperadmins();
