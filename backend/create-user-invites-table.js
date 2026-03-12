const { Pool } = require('pg');

async function createUserInvitesTable() {
  const pool = new Pool({
    host: '72.60.103.151',
    port: 5432,
    database: 'fluiddb',
    user: 'fluidadmin',
    password: String('admin123'),
    ssl: false
  });

  try {
    console.log('🔄 Creating user_invites table...\n');

    // Create user_invites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_invites (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        invited_by INTEGER REFERENCES users(id),
        account_id INTEGER,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ user_invites table created successfully!');
    
    // Verify it was created
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_invites'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Table structure:');
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createUserInvitesTable();
