// Database Connection Test Script
// Run with: node debug-db-test.js

const { Pool } = require('./backend/node_modules/pg');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

const testDatabaseConnection = async () => {
  console.log('🗄️ Testing Database Connection...');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test candidates table
    const result = await client.query('SELECT COUNT(*) FROM candidates');
    console.log('✅ Candidates table accessible, count:', result.rows[0].count);
    
    // Test table structure
    const structure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'candidates'
      ORDER BY ordinal_position
    `);
    console.log('📋 Table structure:');
    structure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Check these settings:');
    console.error('  - PostgreSQL server is running');
    console.error('  - Database name exists:', process.env.DB_NAME);
    console.error('  - User has permissions:', process.env.DB_USER);
    console.error('  - Password is correct');
    console.error('  - Host/Port are correct:', process.env.DB_HOST + ':' + (process.env.DB_PORT || 5432));
  }
};

testDatabaseConnection();