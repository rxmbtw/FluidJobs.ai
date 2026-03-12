const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/database');

async function updateRole() {
  try {
    const email = process.argv[2] || 'sodhi@fluid.live';
    const newRole = process.argv[3] || 'SuperAdmin';

    console.log(`🔄 Updating role for: ${email} to ${newRole}`);
    
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
      [newRole, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ Role updated successfully!');
    console.log('   Email:', result.rows[0].email);
    console.log('   Name:', result.rows[0].name);
    console.log('   Role:', result.rows[0].role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateRole();
