const pool = require('./config/database');

async function createTestJob() {
  try {
    // Get first admin ID
    const adminResult = await pool.query('SELECT id FROM users LIMIT 1');
    const adminId = adminResult.rows[0]?.id || 1;
    
    // Get first account ID
    const accountResult = await pool.query('SELECT account_id FROM accounts LIMIT 1');
    const accountId = accountResult.rows[0]?.account_id || 1;
    
    console.log('Creating test job with:');
    console.log('Admin ID:', adminId);
    console.log('Account ID:', accountId);
    
    const result = await pool.query(`
      INSERT INTO jobs_enhanced (
        title, company, location, description, requirements, 
        salary_range, job_type, experience_level, status, 
        posted_date, created_at, account_id, created_by_user_id
      ) VALUES (
        'Test Job for Accounts Section',
        'Test Company',
        'Test Location',
        'This is a test job to verify accounts section',
        ARRAY['Test Skill'],
        '500000 - 1000000',
        'Full-time',
        'Mid-level',
        'Published',
        NOW(),
        NOW(),
        $1,
        $2
      ) RETURNING id, title, account_id, created_by_user_id
    `, [accountId, adminId]);
    
    console.log('\n✅ Test job created:');
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestJob();
