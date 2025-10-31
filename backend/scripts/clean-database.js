const pool = require('../config/database');

const adminEmails = [
  'admin@fluidjobs.ai',
  'hr@fluidjobs.ai', 
  'manager@fluidjobs.ai',
  'recruiter@fluidjobs.ai',
  'support@fluidjobs.ai'
];

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Show current count
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    console.log(`📊 Current total candidates: ${countResult.rows[0].count}`);
    
    // Show admin emails that will be preserved
    const adminResult = await pool.query(
      'SELECT email, role FROM candidates WHERE email = ANY($1)',
      [adminEmails]
    );
    console.log('🔒 Admin emails to preserve:', adminResult.rows);
    
    // Delete non-admin entries
    const deleteResult = await pool.query(
      'DELETE FROM candidates WHERE email != ALL($1) RETURNING email',
      [adminEmails]
    );
    
    console.log(`🗑️  Deleted ${deleteResult.rows.length} non-admin entries`);
    
    // Show final count
    const finalCount = await pool.query('SELECT COUNT(*) FROM candidates');
    console.log(`📊 Final total candidates: ${finalCount.rows[0].count}`);
    
    console.log('✅ Database cleanup completed');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await pool.end();
  }
}

cleanDatabase();