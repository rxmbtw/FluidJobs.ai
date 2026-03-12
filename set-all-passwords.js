const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/database');
const bcrypt = require('bcryptjs');

async function setAllPasswords() {
  try {
    console.log('🔐 Setting passwords for all users...\n');

    // Get all users
    const users = await pool.query('SELECT id, email, name, role FROM users ORDER BY role, email');
    
    const superAdminPassword = 'Sodhi@123';
    const defaultPassword = 'Fluid@123';

    for (const user of users.rows) {
      const password = user.role === 'SuperAdmin' ? superAdminPassword : defaultPassword;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );

      console.log(`✅ ${user.email} (${user.role}) - Password: ${password}`);
    }

    console.log('\n📊 Summary:');
    console.log(`Total users updated: ${users.rows.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('\nSuperAdmin:');
    users.rows.filter(u => u.role === 'SuperAdmin').forEach(u => {
      console.log(`  ${u.email} / Sodhi@123`);
    });
    console.log('\nOther Users (Admin, HR, Sales):');
    users.rows.filter(u => u.role !== 'SuperAdmin').forEach(u => {
      console.log(`  ${u.email} (${u.role}) / Fluid@123`);
    });

    console.log('\n✅ All passwords updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAllPasswords();
