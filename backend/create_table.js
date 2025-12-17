const pool = require('./config/database');

async function createUnpublishRequestsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS unpublish_requests (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        reason TEXT,
        requested_by VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_unpublish_requests_status ON unpublish_requests(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_unpublish_requests_job_id ON unpublish_requests(job_id)');
    
    console.log('✅ Unpublish requests table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createUnpublishRequestsTable();