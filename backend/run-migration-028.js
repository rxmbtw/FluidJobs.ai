const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 Running migration 028: Add phone to users table...\n');

  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/028_add_phone_to_users.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);

    console.log('✅ Migration 028 completed successfully!');
    console.log('📋 Added phone column to users table');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
