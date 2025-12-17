const { Pool } = require('pg');
require('dotenv').config();

const gcp = new Pool({
  host: '34.14.144.201',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Fluidjobsaidb@01',
  ssl: { rejectUnauthorized: false }
});

const vps = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function migrateAdmins() {
  console.log('1️⃣ Migrating Admin Users...');
  const data = await gcp.query('SELECT * FROM users WHERE username IS NOT NULL');
  
  let migrated = 0;
  for (const row of data.rows) {
    try {
      await vps.query(
        'INSERT INTO users (email, name, role, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [row.username, row.username, row.role || 'admin', row.created_at]
      );
      migrated++;
    } catch (e) {
      console.log(`   ⚠️  Skipped: ${row.username}`);
    }
  }
  console.log(`   ✅ ${migrated}/${data.rows.length} admin users migrated\n`);
}

async function migrateJobs() {
  console.log('2️⃣ Migrating Jobs...');
  const data = await gcp.query('SELECT * FROM jobs_enhanced WHERE job_title IS NOT NULL');
  
  let migrated = 0;
  for (const row of data.rows) {
    try {
      const salaryRange = row.min_salary && row.max_salary 
        ? `${row.min_salary} - ${row.max_salary}` 
        : null;
      
      await vps.query(
        `INSERT INTO jobs_enhanced (title, company, location, description, requirements, 
         salary_range, job_type, experience_level, jd_pdf_url, status, posted_date, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          row.job_title,
          row.company_id || 'Unknown',
          row.locations,
          row.job_description,
          row.skills,
          salaryRange,
          row.job_type,
          `${row.min_experience || 0}-${row.max_experience || 0} years`,
          row.jd_attachment_name,
          row.status || 'active',
          row.published_date,
          row.created_at
        ]
      );
      migrated++;
    } catch (e) {
      console.log(`   ⚠️  Skipped job: ${row.job_title} - ${e.message}`);
    }
  }
  console.log(`   ✅ ${migrated}/${data.rows.length} jobs migrated\n`);
}

async function migrate() {
  try {
    console.log('🚀 Migrating Remaining Data with Schema Transformation\n');
    
    await migrateAdmins();
    await migrateJobs();
    
    console.log('✅ Migration completed!');
    console.log('\n📊 Final Status:');
    
    const counts = await vps.query(`
      SELECT 
        (SELECT COUNT(*) FROM candidates) as candidates,
        (SELECT COUNT(*) FROM users) as admins,
        (SELECT COUNT(*) FROM jobs_enhanced) as jobs,
        (SELECT COUNT(*) FROM user_whitelist) as whitelist
    `);
    
    console.log(`   Candidates: ${counts.rows[0].candidates}`);
    console.log(`   Admins: ${counts.rows[0].admins}`);
    console.log(`   Jobs: ${counts.rows[0].jobs}`);
    console.log(`   Whitelist: ${counts.rows[0].whitelist}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await gcp.end();
    await vps.end();
  }
}

migrate();
