/**
 * Migration Script: Merge superadmins table into users table
 * 
 * This script will:
 * 1. Migrate all superadmin records to users table with role='SuperAdmin'
 * 2. Verify the migration
 * 3. Optionally drop the superadmins table (commented out for safety)
 * 
 * Run with: node backend/scripts/migrate-superadmin-to-users.js
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function migrateSuperAdmins() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting SuperAdmin migration...\n');

    // Step 0: Ensure users table has profile_picture column
    console.log('📝 Ensuring users table has profile_picture column...');
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    `);
    console.log('✅ Column check complete\n');

    // Step 1: Check if superadmins table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'superadmins'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ superadmins table does not exist. Nothing to migrate.');
      return;
    }

    // Step 2: Get all superadmins
    const superadmins = await client.query('SELECT * FROM superadmins');
    console.log(`📊 Found ${superadmins.rows.length} superadmin(s) to migrate\n`);

    if (superadmins.rows.length === 0) {
      console.log('✅ No superadmins to migrate.');
      return;
    }

    await client.query('BEGIN');

    // Step 3: Migrate each superadmin to users table
    let migratedCount = 0;
    let skippedCount = 0;

    for (const superadmin of superadmins.rows) {
      console.log(`Processing: ${superadmin.email}`);

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id, role FROM users WHERE LOWER(email) = LOWER($1)',
        [superadmin.email]
      );

      if (existingUser.rows.length > 0) {
        // User exists, update role to SuperAdmin
        await client.query(
          `UPDATE users 
           SET role = 'SuperAdmin', 
               password_hash = COALESCE(password_hash, $1),
               name = COALESCE(name, $2),
               profile_picture = COALESCE(profile_picture, $3)
           WHERE LOWER(email) = LOWER($4)`,
          [superadmin.password_hash, superadmin.name, superadmin.profile_picture, superadmin.email]
        );
        console.log(`  ✅ Updated existing user to SuperAdmin role`);
        migratedCount++;
      } else {
        // User doesn't exist, insert new
        await client.query(
          `INSERT INTO users (email, password_hash, name, role, profile_picture, created_at)
           VALUES ($1, $2, $3, 'SuperAdmin', $4, $5)`,
          [superadmin.email, superadmin.password_hash, superadmin.name, 
           superadmin.profile_picture, superadmin.created_at]
        );
        console.log(`  ✅ Created new user with SuperAdmin role`);
        migratedCount++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Skipped: ${skippedCount}`);

    // Step 4: Verify migration
    console.log('\n🔍 Verifying migration...');
    const verifyUsers = await client.query(
      "SELECT id, email, name, role FROM users WHERE role = 'SuperAdmin'"
    );
    
    console.log(`\n📊 SuperAdmin users in users table:`);
    verifyUsers.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    });

    // Step 5: Show what's still in superadmins table
    const remainingSuperadmins = await client.query('SELECT id, email, name FROM superadmins');
    console.log(`\n📊 Records still in superadmins table: ${remainingSuperadmins.rows.length}`);
    remainingSuperadmins.rows.forEach(sa => {
      console.log(`   - ID: ${sa.id}, Email: ${sa.email}, Name: ${sa.name}`);
    });

    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('1. Test SuperAdmin login with the migrated account');
    console.log('2. Test all SuperAdmin functionality');
    console.log('3. Update authentication middleware to use users table only');
    console.log('4. Update all queries that reference superadmins table');
    console.log('5. After thorough testing, you can drop the superadmins table');
    console.log('\n💡 To drop the superadmins table (ONLY AFTER TESTING):');
    console.log('   DROP TABLE superadmins CASCADE;');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateSuperAdmins()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
