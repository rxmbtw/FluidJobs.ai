const pool = require('./config/database');

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'candidates' 
      AND column_name LIKE '%image%'
    `);
    console.log('Image columns:', result.rows);
    
    const result2 = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'candidates' 
      AND column_name LIKE '%resume%'
    `);
    console.log('Resume columns:', result2.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkColumns();