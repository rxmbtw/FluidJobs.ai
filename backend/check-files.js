const pool = require('./config/database');

async function checkFiles() {
  try {
    const result = await pool.query(`
      SELECT candidate_id, profile_image_url, resume_files 
      FROM candidates 
      WHERE candidate_id = 'FLC0000000915'
    `);
    
    console.log('Current file data for your user:');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkFiles();