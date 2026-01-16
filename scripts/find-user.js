const pool = require('./config/database');

async function findUser() {
  try {
    const result = await pool.query(`
      SELECT id, candidate_id, name, email 
      FROM users 
      WHERE candidate_id = 'FLC9602989613'
    `);
    console.log('User found:');
    console.table(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

findUser();
