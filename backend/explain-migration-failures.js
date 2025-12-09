const { Pool } = require('pg');

const gcp = new Pool({
  host: '34.14.144.201',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Fluidjobsaidb@01',
  ssl: { rejectUnauthorized: false }
});

async function explain() {
  console.log('🔍 WHY MIGRATION FAILED:\n');
  
  // Check admin table
  console.log('1️⃣ ADMIN TABLE (7 rows in GCP):');
  const adminCols = await gcp.query("SELECT column_name FROM information_schema.columns WHERE table_name='admin' ORDER BY ordinal_position");
  console.log('   GCP Schema:', adminCols.rows.map(r => r.column_name).join(', '));
  console.log('   VPS Expected: email, name, role, created_at');
  console.log('   ❌ REASON: GCP has "admin_id, username, user_license, password_hash" instead of "email, name"');
  console.log('   → Cannot map columns automatically\n');
  
  // Check jobs_enhanced
  console.log('2️⃣ JOBS_ENHANCED TABLE (11 rows in GCP):');
  const jobsCols = await gcp.query("SELECT column_name FROM information_schema.columns WHERE table_name='jobs_enhanced' ORDER BY ordinal_position");
  console.log('   GCP Schema:', jobsCols.rows.length, 'columns');
  console.log('   First 10:', jobsCols.rows.slice(0, 10).map(r => r.column_name).join(', '));
  console.log('   VPS Expected: title, company, location, description, requirements...');
  console.log('   ❌ REASON: GCP has "job_title, company_id, job_domain" instead of "title, company"');
  console.log('   → Column names completely different\n');
  
  // Check pending_auth_roles
  console.log('3️⃣ PENDING_AUTH_ROLES TABLE (32 rows in GCP):');
  const authCols = await gcp.query("SELECT column_name FROM information_schema.columns WHERE table_name='pending_auth_roles' ORDER BY ordinal_position");
  console.log('   GCP Schema:', authCols.rows.map(r => r.column_name).join(', '));
  console.log('   VPS Expected: email, role, created_at');
  console.log('   ❌ REASON: GCP has "session_id" instead of "email"');
  console.log('   → This is session data, not permanent user data\n');
  
  console.log('📋 SUMMARY:');
  console.log('   • GCP database uses OLD schema from previous version');
  console.log('   • VPS database uses NEW schema for current version');
  console.log('   • Column names and structure are incompatible');
  console.log('   • Only candidates table had matching schema (migrated successfully)');
  
  await gcp.end();
}

explain().catch(console.error);
