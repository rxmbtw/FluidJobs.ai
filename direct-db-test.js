const { Pool } = require('pg');

const pool = new Pool({
  host: '34.14.144.201',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Fluidjobsaidb@01',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function testDatabase() {
  try {
    console.log('Testing direct database connection...');
    console.log('Host: 34.14.144.201');
    console.log('Database: postgres');
    console.log('User: postgres');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    
    // Check if candidates table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'candidates'
      )
    `);
    console.log('✅ Candidates table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get candidates data
      const candidates = await pool.query('SELECT * FROM public.candidates LIMIT 5');
      console.log('✅ Candidates found:', candidates.rows.length);
      if (candidates.rows.length > 0) {
        console.log('Sample candidate:', JSON.stringify(candidates.rows[0], null, 2));
      }
      
      // Get total count
      const count = await pool.query('SELECT COUNT(*) FROM public.candidates');
      console.log('✅ Total candidates:', count.rows[0].count);
    } else {
      console.log('❌ Candidates table does not exist');
      
      // List all tables
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('Available tables:', tables.rows.map(r => r.table_name));
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();