const { Pool } = require('pg');

async function verifyPhoneColumn() {
  const pool = new Pool({
    host: '72.60.103.151',
    port: 5432,
    database: 'fluiddb',
    user: 'fluidadmin',
    password: String('admin123'),
    ssl: false
  });

  try {
    // Check if phone column exists
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Phone column exists in users table:');
      console.log('   Column:', result.rows[0].column_name);
      console.log('   Type:', result.rows[0].data_type);
      console.log('   Max Length:', result.rows[0].character_maximum_length);
      console.log('   Nullable:', result.rows[0].is_nullable);
    } else {
      console.log('❌ Phone column does NOT exist');
    }

    // Check all columns in users table
    const allColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 All columns in users table:');
    allColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyPhoneColumn();
