const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupForgotPasswordTable() {
  try {
    console.log('🔧 Setting up forgot password table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Password reset codes table created successfully');
    
    // Test the table
    const testQuery = 'SELECT COUNT(*) FROM password_reset_codes';
    await pool.query(testQuery);
    console.log('✅ Table is working correctly');
    
  } catch (error) {
    console.error('❌ Error setting up forgot password table:', error.message);
  } finally {
    await pool.end();
  }
}

setupForgotPasswordTable();