const { Pool } = require('pg');

async function addPhoneColumn() {
  console.log('🔄 Adding phone column to users table...\n');

  const pool = new Pool({
    host: '72.60.103.151',
    port: 5432,
    database: 'fluiddb',
    user: 'fluidadmin',
    password: String('admin123'), // Explicitly convert to string
    ssl: false,
    connectionTimeoutMillis: 10000
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');

    // Add phone column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    `);

    console.log('✅ Phone column added successfully!');
    
    // Verify it was added
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: phone column exists');
      console.log('   Type:', result.rows[0].data_type);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addPhoneColumn();
