const pool = require('./config/database');

(async () => {
  try {
    const result = await pool.query(`
      SELECT id, email, name, role, 
             password_hash IS NOT NULL as has_password
      FROM users 
      WHERE role = 'SuperAdmin'
      ORDER BY id
    `);
    
    console.log('\n=== SuperAdmin Users ===\n');
    if (result.rows.length === 0) {
      console.log('No SuperAdmin users found!');
    } else {
      console.table(result.rows);
    }
    
    // Also check all admin-type users
    const allAdmins = await pool.query(`
      SELECT id, email, name, role, 
             password_hash IS NOT NULL as has_password
      FROM users 
      WHERE role IN ('SuperAdmin', 'Admin', 'Recruiter', 'HR', 'Sales')
      ORDER BY role, id
    `);
    
    console.log('\n=== All Admin Users ===\n');
    console.table(allAdmins.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
