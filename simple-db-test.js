const pool = require('./backend/config/database');

async function simpleTest() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', result.rows[0]);
    
    // Check if candidates table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'candidates'
      )
    `);
    console.log('Candidates table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) FROM candidates');
      console.log('Candidates count:', count.rows[0].count);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

simpleTest();