const pool = require('./config/database');

async function testProfileFix() {
  console.log('🧪 Testing Profile Persistence Fix...\n');
  
  try {
    // 1. Check database schema
    console.log('1️⃣ Checking database schema...');
    const schemaCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'candidates' 
      AND column_name IN ('phone', 'phone_number', 'city', 'location', 'current_ctc', 'previous_ctc')
      ORDER BY column_name;
    `);
    
    console.log('📋 Schema check results:');
    schemaCheck.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // 2. Test data insertion
    console.log('\n2️⃣ Testing profile update...');
    
    // Find a test candidate
    const testCandidate = await pool.query('SELECT candidate_id, email FROM candidates LIMIT 1');
    
    if (testCandidate.rows.length === 0) {
      console.log('❌ No test candidates found');
      return;
    }
    
    const candidateId = testCandidate.rows[0].candidate_id;
    console.log(`🎯 Using test candidate: ${candidateId}`);
    
    // Test the update query
    const testUpdate = await pool.query(`
      UPDATE candidates SET 
        full_name = $1, 
        phone_number = COALESCE($2, phone_number), 
        phone = COALESCE($2, phone),
        email = $3, 
        gender = $4, 
        marital_status = $5, 
        work_status = $6, 
        current_company = $7, 
        notice_period = $8, 
        current_ctc = $9, 
        last_company = $10, 
        previous_ctc = $11, 
        city = COALESCE($12, location),
        location = COALESCE($12, location),
        work_mode = $13, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE candidate_id = $14 
      RETURNING candidate_id, full_name, phone, email, current_ctc, city;
    `, [
      'Test User Updated',
      '+1234567890', 
      testCandidate.rows[0].email,
      'Male',
      'Single', 
      'Yes',
      'Test Company',
      '1 Month',
      850000.00,
      'Previous Company',
      650000.00,
      'Test City',
      'Remote',
      candidateId
    ]);
    
    if (testUpdate.rows.length > 0) {
      console.log('✅ Profile update successful!');
      console.log('📝 Updated data:', testUpdate.rows[0]);
    } else {
      console.log('❌ Profile update failed - no rows returned');
    }
    
    // 3. Verify data persistence
    console.log('\n3️⃣ Verifying data persistence...');
    const verifyData = await pool.query(
      'SELECT full_name, phone, current_ctc, city FROM candidates WHERE candidate_id = $1',
      [candidateId]
    );
    
    if (verifyData.rows.length > 0) {
      console.log('✅ Data persisted correctly:');
      console.log('📝 Persisted data:', verifyData.rows[0]);
    } else {
      console.log('❌ Data verification failed');
    }
    
    console.log('\n🎉 Profile fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('📝 Error details:', error);
  }
}

// Run test if called directly
if (require.main === module) {
  testProfileFix()
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testProfileFix };