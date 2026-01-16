const pool = require('./config/database');

async function checkJobsTable() {
  try {
    // Check if jobs table exists and its structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      ORDER BY ordinal_position
    `);
    
    console.log('Jobs table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check for any existing jobs
    const jobsCount = await pool.query('SELECT COUNT(*) as total FROM jobs');
    console.log(`\nTotal jobs in database: ${jobsCount.rows[0].total}`);
    
    if (jobsCount.rows[0].total > 0) {
      const jobs = await pool.query('SELECT id, title, company, status, created_at FROM jobs LIMIT 5');
      console.log('\nSample jobs:');
      jobs.rows.forEach(job => {
        console.log(`ID: ${job.id}, Title: ${job.title}, Company: ${job.company}, Status: ${job.status}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkJobsTable();