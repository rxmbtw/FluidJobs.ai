const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createStatusHistoryTable() {
  try {
    const sqlPath = path.join(__dirname, '../config/07_application_status_history.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Application status history table created successfully');
    
    // Verify table creation
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'application_status_history'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table structure:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await pool.end();
  }
}

createStatusHistoryTable();