const pool = require('./config/database');

async function debug() {
  try {
    console.log('=== ALL ADMINS ===');
    const admins = await pool.query('SELECT id, name, email FROM users');
    console.table(admins.rows);
    
    console.log('\n=== TEST JOB DETAILS ===');
    const testJob = await pool.query('SELECT id, title, account_id, created_by_user_id FROM jobs_enhanced WHERE id = 14');
    console.table(testJob.rows);
    
    console.log('\n=== TESTING API FOR ADMIN ID 3 ===');
    const result = await pool.query(`
      SELECT 
        a.account_id,
        a.account_name,
        a.created_at,
        COUNT(DISTINCT j.id) as openings,
        COUNT(DISTINCT j.created_by_user_id) as users,
        MAX(j.updated_at) as last_activity
      FROM accounts a
      INNER JOIN jobs_enhanced j ON j.account_id = a.account_id
      WHERE j.created_by_user_id = $1
      GROUP BY a.account_id, a.account_name, a.created_at
      ORDER BY a.created_at DESC
    `, [3]);
    
    console.log('Result for admin ID 3:');
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debug();
