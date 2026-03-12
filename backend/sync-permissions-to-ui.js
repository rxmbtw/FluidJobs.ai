const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// UI permissions mapping (plural in UI → singular in DB)
const PERMISSION_MAPPING = {
  // Job Management
  'create_jobs': 'create_job',
  'edit_jobs': 'edit_job',
  'delete_jobs': 'delete_job',
  'approve_jobs': 'approve_job',
  'publish_jobs': 'publish_job',
  
  // Candidate Management
  'restrict_candidates': 'restrict_candidate',
  'unrestrict_candidates': 'unrestrict_candidate',
  
  // Other mappings
  'manage_candidates': 'manage_candidate_stages',
};

// New permissions that need to be added to permissions table
const NEW_PERMISSIONS = [
  { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management' },
  { name: 'create_candidates', description: 'Create Candidates', category: 'candidate_management' },
  { name: 'edit_candidates', description: 'Edit Candidates', category: 'candidate_management' },
  { name: 'send_invites', description: 'Send Candidate Invitations', category: 'candidate_management' },
  { name: 'bulk_import', description: 'Bulk Import Candidates', category: 'candidate_management' },
  { name: 'export_candidates', description: 'Export Candidate Data', category: 'candidate_management' },
  { name: 'view_pipeline', description: 'View Hiring Pipeline', category: 'pipeline_management' },
  { name: 'edit_pipeline', description: 'Edit Hiring Pipeline', category: 'pipeline_management' },
  { name: 'edit_job_settings', description: 'Edit Job Settings', category: 'pipeline_management' },
  { name: 'manage_interviews', description: 'Manage Interviews', category: 'pipeline_management' },
  { name: 'add_interview_feedback', description: 'Add Interview Feedback', category: 'pipeline_management' },
  { name: 'track_own_approvals', description: 'Track Own Approval Status', category: 'approvals' },
  { name: 'view_reports', description: 'View Reports', category: 'reporting' },
  { name: 'export_reports', description: 'Export Reports', category: 'reporting' },
];

// Role permissions from UI (using DB permission names)
const ROLE_PERMISSIONS_UI = {
  'HR': [
    'view_jobs',
    'view_job_analytics',
    'view_candidates',
    'create_candidates',
    'edit_candidates',
    'manage_candidate_stages', // manage_candidates in UI
    'send_invites',
    'bulk_import',
    'restrict_candidate', // restrict_candidates in UI
    'export_candidates',
    'view_pipeline',
    'edit_pipeline',
    'edit_job_settings',
    'manage_interviews',
    'add_interview_feedback',
    'view_accounts',
    'view_dashboard', // Keep existing
    'view_reports',
    'view_analytics',
    'export_reports'
  ],
  'Recruiter': [
    'view_jobs',
    'create_job', // create_jobs in UI
    'edit_job', // edit_jobs in UI
    'view_job_analytics',
    'view_candidates',
    'create_candidates',
    'edit_candidates',
    'manage_candidate_stages', // manage_candidates in UI
    'send_invites',
    'restrict_candidate', // restrict_candidates in UI
    'export_candidates',
    'view_pipeline',
    'edit_pipeline',
    'edit_job_settings',
    'manage_interviews',
    'add_interview_feedback',
    'view_accounts',
    'view_dashboard', // Keep existing
    'track_own_approvals',
    'view_reports',
    'view_analytics',
    'export_reports'
  ],
  'Sales': [
    'view_jobs',
    'create_job', // create_jobs in UI
    'edit_job', // edit_jobs in UI
    'view_job_analytics',
    'view_candidates',
    'view_pipeline',
    'view_accounts',
    'view_dashboard', // Keep existing
    'track_own_approvals',
    'view_reports',
    'view_analytics'
  ],
  'Interviewer': [
    'view_jobs',
    'view_job_analytics',
    'view_candidates',
    'edit_candidates',
    'view_pipeline',
    'edit_pipeline',
    'manage_interviews',
    'add_interview_feedback',
    'view_accounts',
    'view_dashboard', // Keep existing
    'view_reports'
  ]
};

async function syncPermissions() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Starting permissions synchronization...\n');
    
    // Step 1: Add new permissions to permissions table
    console.log('📝 Step 1: Adding new permissions to permissions table...');
    for (const perm of NEW_PERMISSIONS) {
      const exists = await client.query(
        'SELECT id FROM permissions WHERE name = $1',
        [perm.name]
      );
      
      if (exists.rows.length === 0) {
        await client.query(
          'INSERT INTO permissions (name, description) VALUES ($1, $2)',
          [perm.name, perm.description]
        );
        console.log(`  ✅ Added: ${perm.name}`);
      } else {
        console.log(`  ⏭️  Exists: ${perm.name}`);
      }
    }
    
    // Step 2: Get all permission IDs
    console.log('\n📊 Step 2: Fetching permission IDs...');
    const permsResult = await client.query('SELECT id, name FROM permissions');
    const permIdMap = {};
    permsResult.rows.forEach(row => {
      permIdMap[row.name] = row.id;
    });
    console.log(`  Found ${Object.keys(permIdMap).length} permissions`);
    
    // Step 3: Update role_permissions for each role
    console.log('\n🔧 Step 3: Updating role_permissions...');
    
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS_UI)) {
      console.log(`\n  Processing role: ${role}`);
      
      // Delete existing permissions for this role
      await client.query('DELETE FROM role_permissions WHERE role = $1', [role]);
      console.log(`    🗑️  Cleared existing permissions`);
      
      // Add new permissions
      let added = 0;
      for (const permName of permissions) {
        const permId = permIdMap[permName];
        if (permId) {
          await client.query(
            'INSERT INTO role_permissions (role, permission_id, is_default) VALUES ($1, $2, true)',
            [role, permId]
          );
          added++;
        } else {
          console.log(`    ⚠️  Permission not found: ${permName}`);
        }
      }
      console.log(`    ✅ Added ${added} permissions`);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Permissions synchronization complete!');
    
    // Step 4: Verify
    console.log('\n📊 Verification:');
    for (const role of Object.keys(ROLE_PERMISSIONS_UI)) {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM role_permissions WHERE role = $1`,
        [role]
      );
      console.log(`  ${role}: ${result.rows[0].count} permissions`);
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

syncPermissions();
