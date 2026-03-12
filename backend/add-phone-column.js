const pool = require('./config/database');

async function addPhoneColumn() {
  console.log('🔄 Adding phone column to users table...\n');

  try {
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
