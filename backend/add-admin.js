const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function addAdmin(username, password, role = 'admin') {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO admin (username, password_hash, role) VALUES ($1, $2, $3) RETURNING admin_id, username, role',
      [username, passwordHash, role]
    );
    
    console.log('✅ Admin added successfully:');
    console.log('   Username:', result.rows[0].username);
    console.log('   Role:', result.rows[0].role);
    console.log('   ID:', result.rows[0].admin_id);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

// Get command line arguments
const username = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || 'admin';

if (!username || !password) {
  console.log('Usage: node add-admin.js <username/email> <password> [role]');
  console.log('Example: node add-admin.js admin@fluidjobs.com password123 admin');
  console.log('Example: node add-admin.js hr@fluidjobs.com hrpass123 hr');
  process.exit(1);
}

addAdmin(username, password, role);
