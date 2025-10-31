const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupPasswordReset() {
  try {
    console.log('🔧 Setting up password reset functionality...');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'create-password-reset-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Password reset table created successfully!');
    console.log('📧 Make sure to set EMAIL_USER and EMAIL_PASS in your .env file');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up password reset:', error);
    process.exit(1);
  }
}

setupPasswordReset();