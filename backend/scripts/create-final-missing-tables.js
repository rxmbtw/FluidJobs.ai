const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createFinalMissingTables() {
  try {
    // Create company_users table
    const companyUsersSQL = fs.readFileSync(path.join(__dirname, '../config/17_company_users.sql'), 'utf8');
    await pool.query(companyUsersSQL);
    console.log('✅ Company users table created');
    
    // Create job_categories table
    const jobCategoriesSQL = fs.readFileSync(path.join(__dirname, '../config/18_job_categories.sql'), 'utf8');
    await pool.query(jobCategoriesSQL);
    console.log('✅ Job categories table created');
    
    // Create job_attachments table
    const jobAttachmentsSQL = fs.readFileSync(path.join(__dirname, '../config/19_job_attachments.sql'), 'utf8');
    await pool.query(jobAttachmentsSQL);
    console.log('✅ Job attachments table created');
    
    console.log('\n🎉 ALL missing tables created! Database is now 100% complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createFinalMissingTables();