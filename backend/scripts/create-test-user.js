const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Generate candidate ID
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    const count = parseInt(countResult.rows[0].count) + 1;
    const candidateId = `FLC${String(count).padStart(10, '0')}`;
    
    // Insert test candidate
    await pool.query(
      `INSERT INTO candidates (
        candidate_id, full_name, email, phone, password_hash, role
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET password_hash = $5`,
      [candidateId, 'Test Candidate', 'test@fluidjobs.ai', '9999999999', hashedPassword, 'Candidate']
    );
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@fluidjobs.ai');
    console.log('🔑 Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
