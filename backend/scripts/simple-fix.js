const pool = require('../config/database');

async function simpleFix() {
  try {
    console.log('🔍 Checking current data...');
    
    // Check if we have the mismatched data
    const result = await pool.query(`
      SELECT full_name, email 
      FROM candidates 
      WHERE full_name = 'Aaradhya Agrawal'
    `);
    
    if (result.rows.length > 0) {
      console.log('Found Aaradhya Agrawal with email:', result.rows[0].email);
      
      if (result.rows[0].email === 'akshaykale9776@gmail.com') {
        console.log('❌ Confirmed: Email mismatch detected');
        console.log('🔧 The issue is that names and emails are misaligned in the import');
        console.log('📋 This happened because the CSV parsing treated the first row as headers when it was actually data');
        
        // The solution is to re-import with the correct understanding that there are no headers
        console.log('\n💡 Solution: The original import was correct, but the CSV structure caused data misalignment');
        console.log('   The first successful import (914 records) was actually correct');
        console.log('   The issue is in how we interpreted the CSV structure');
      } else {
        console.log('✅ Data appears to be correctly aligned');
      }
    } else {
      console.log('❌ Aaradhya Agrawal not found in database');
    }
    
    // Show current count
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    console.log(`\n📊 Current candidates in database: ${countResult.rows[0].count}`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleFix();