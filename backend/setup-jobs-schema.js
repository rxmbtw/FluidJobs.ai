const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupSchema() {
  try {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'config/enhanced_jobs_schema.sql'),
      'utf8'
    );
    
    await pool.query(schemaSQL);
    console.log('✅ Jobs schema created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    process.exit(1);
  }
}

setupSchema();
