const pool = require('./config/database');

async function checkJobs() {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM jobs');
    console.log('Total jobs in database:', result.rows[0].total);
    
    const statusResult = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM jobs 
      GROUP BY status
      ORDER BY status
    `);
    
    console.log('\nJobs by status:');
    statusResult.rows.forEach(row => {
      console.log(`${row.status}: ${row.count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkJobs();