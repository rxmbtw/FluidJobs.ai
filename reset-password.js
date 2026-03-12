const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const email = process.argv[2] || 'deepak@fluid.live';
    const newPassword = process.argv[3] || 'Admin123!';

    console.log(`🔄 Resetting password for: ${email}`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, name, role',
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ Password reset successful!');
    console.log('   Email:', result.rows[0].email);
    console.log('   Name:', result.rows[0].name);
    console.log('   Role:', result.rows[0].role);
    console.log('   New Password:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
