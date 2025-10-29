const pool = require('../config/database');

async function createAuthTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_auth_roles (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
      )
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_auth_session ON pending_auth_roles(session_id)
    `);
    
    console.log('✅ pending_auth_roles table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createAuthTable();