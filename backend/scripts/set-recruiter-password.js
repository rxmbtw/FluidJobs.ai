const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function setPassword() {
  try {
    const email = 'shuklashobhit0001@gmail.com';
    const password = 'Fluid@123';
    
    console.log('\n🔍 Checking user...');
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    
    if (userCheck.rows.length === 0) {
      console.log('❌ User not found in users table');
      await pool.end();
      return;
    }
    
    const user = userCheck.rows[0];
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Current password_hash:', user.password_hash ? 'EXISTS' : 'NULL');
    
    // Hash the password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');
    
    // Update the password
    console.log('\n💾 Updating password in database...');
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, user.id]
    );
    
    console.log('✅ Password updated successfully!');
    console.log('\n📋 You can now login with:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setPassword();
