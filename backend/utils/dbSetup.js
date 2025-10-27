const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database schema...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database schema created successfully!');
    
    // Test with a simple query
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('🕒 Database time:', result.rows[0].current_time);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
}

async function testConnection() {
  try {
    const result = await pool.query('SELECT version()');
    console.log('✅ Database connected:', result.rows[0].version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = { setupDatabase, testConnection };