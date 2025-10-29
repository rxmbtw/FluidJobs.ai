const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function addAuthFields() {
  try {
    // Add role and password_hash columns if they don't exist
    await pool.query(`
      ALTER TABLE candidates 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Candidate',
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);
    
    // Set admin role and password for ramsurse2@gmail.com
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    
    await pool.query(`
      UPDATE candidates 
      SET role = 'Admin', password_hash = $1 
      WHERE email = 'ramsurse2@gmail.com'
    `, [hashedPassword]);
    
    console.log('✅ Auth fields added and admin user configured');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAuthFields();