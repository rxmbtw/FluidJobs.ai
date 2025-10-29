const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function addAdminUsers() {
  try {
    const adminEmails = [
      'admin@fluidjobs.ai',
      'hr@fluidjobs.ai', 
      'manager@fluidjobs.ai',
      'ramsurse2@gmail.com',
      'rohnit@fluid.live',
      'deepesh.sodhi@fluid.live',
      'ram@fluid.live',
      'meetpandya@fluid.live',
      'pmeet8926@gmail.com',
      'meetpandya0101@outlook.com'
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
    
    console.log('✅ Admin users added/updated');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAdminUsers();