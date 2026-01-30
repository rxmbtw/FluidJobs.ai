const pool = require('./config/database');

async function listAllUsers() {
  try {
    console.log('👥 EXISTING USERS IN THE APPLICATION\n');
    
    // Get all users from users table
    console.log('📋 USERS TABLE:');
    const users = await pool.query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY role, name
    `);
    
    if (users.rows.length > 0) {
      users.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('   No users found in users table\n');
    }
    
    // Get all superadmins
    console.log('👑 SUPERADMINS TABLE:');
    const superadmins = await pool.query(`
      SELECT id, name, email, created_at 
      FROM superadmins 
      ORDER BY name
    `);
    
    if (superadmins.rows.length > 0) {
      superadmins.rows.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: SuperAdmin`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Created: ${new Date(admin.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('   No superadmins found\n');
    }
    
    // Summary by role
    console.log('📊 SUMMARY BY ROLE:');
    const roleSummary = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `);
    
    roleSummary.rows.forEach(role => {
      console.log(`   ${role.role}: ${role.count} users`);
    });
    
    const superAdminCount = superadmins.rows.length;
    if (superAdminCount > 0) {
      console.log(`   SuperAdmin: ${superAdminCount} users`);
    }
    
    console.log(`\n📈 TOTAL USERS: ${users.rows.length + superadmins.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    process.exit(0);
  }
}

listAllUsers();