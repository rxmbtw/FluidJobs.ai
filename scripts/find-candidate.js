const pool = require('./config/database');

async function findCandidate() {
  try {
    const result = await pool.query(`
      SELECT id, candidate_id, name, email 
      FROM candidates 
      WHERE candidate_id = 'FLC9602989613'
    `);
    console.log('Candidate found:');
    console.table(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

findCandidate();
