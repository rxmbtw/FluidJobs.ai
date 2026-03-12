const pool = require('./config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function createUser() {
  const name = 'Shobhit Shukla';
  const email = 'shuklashobhit111@gmail.com';
  const role = 'Recruiter'; // Change to 'HR', 'Sales', or 'Interviewer' if needed
  const phone = '9284567890'; // Optional
  
  console.log('🔧 Creating user...');
  console.log('📧 Email:', email);
  console.log('👤 Name:', name);
  console.log('🎭 Role:', role);
  
  try {
    // Check if email exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (emailCheck.rows.length > 0) {
      console.log('❌ Email already exists!');
      process.exit(1);
    }
    
    // Create temporary password
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, role, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [name, email, role, hashedPassword]
    );
    
    const userId = result.rows[0].id;
    
    console.log('✅ User created successfully!');
    console.log('🆔 User ID:', userId);
    console.log('🔑 Temporary Password:', tempPassword);
    console.log('');
    console.log('📧 An invite email should be sent separately.');
    console.log('⚠️  For now, the user can login with the temporary password above.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

createUser();
