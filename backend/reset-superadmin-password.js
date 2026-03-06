const pool = require('./config/database');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const email = 'sodhi@fluid.live';
    const newPassword = 'Sodhi@123';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 AND role = $3 RETURNING id, email, name',
      [hashedPassword, email, 'SuperAdmin']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Password updated successfully for:', result.rows[0]);
      console.log('\nLogin credentials:');
      console.log('Email:', email);
      console.log('Password:', newPassword);
    } else {
      console.log('❌ SuperAdmin not found with email:', email);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
