const pool = require('../config/database');

async function verifyDatabaseCompleteness() {
  try {
    // Get all existing tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Current Database Tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    console.log('\n🔍 Checking for missing critical functionality...\n');
    
    // Check for missing tables based on application features
    const requiredTables = [
      'candidates', 'companies', 'jobs_enhanced', 'applications',
      'contact_submissions', 'inquiries', 'user_sessions', 'login_attempts',
      'application_details', 'interviews', 'application_status_history',
      'notifications', 'email_templates', 'email_logs',
      'user_activity', 'job_metrics', 'skills_master', 'candidate_skills', 'job_requirements'
    ];
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing Tables:');
      missingTables.forEach(table => console.log(`  - ${table}`));
    } else {
      console.log('✅ All required tables exist');
    }
    
    // Check for potential gaps in functionality
    console.log('\n🔍 Potential Functionality Gaps:');
    
    // Check if we need saved jobs table
    if (!existingTables.includes('saved_jobs')) {
      console.log('⚠️  Missing: saved_jobs (for candidate job bookmarks)');
    }
    
    // Check if we need company users table
    if (!existingTables.includes('company_users')) {
      console.log('⚠️  Missing: company_users (for HR/company staff management)');
    }
    
    // Check if we need job categories table
    if (!existingTables.includes('job_categories')) {
      console.log('⚠️  Missing: job_categories (for job categorization)');
    }
    
    // Check if we need file attachments for jobs
    if (!existingTables.includes('job_attachments')) {
      console.log('⚠️  Missing: job_attachments (for JD files from job creation)');
    }
    
    console.log('\n📊 Database Statistics:');
    console.log(`Total Tables: ${existingTables.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyDatabaseCompleteness();