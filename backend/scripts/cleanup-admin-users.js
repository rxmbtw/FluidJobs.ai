const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function cleanupAdminUsers() {
  try {
    // First, remove admin role from all users
    await pool.query(`UPDATE candidates SET role = 'Candidate' WHERE role = 'Admin'`);
    
    // Then add admin role only to specified emails
    const adminEmails = [
      'ram@fluid.live',
      'meetpandya@fluid.live',
      'deepesh.sodhi@fluid.live',
      'rohnit@fluid.live',
      'shobhit@fluid.live'
    ];
    
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    
    for (const email of adminEmails) {
      await pool.query(`
        INSERT INTO candidates (candidate_id, full_name, email, role, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, 'Admin', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET 
        role = 'Admin', 
        password_hash = $4
      `, [
        `FLC${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
        email.split('@')[0],
        email,
        hashedPassword
      ]);
    }
    
    console.log('✅ Admin users cleaned up and updated');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupAdminUsers();