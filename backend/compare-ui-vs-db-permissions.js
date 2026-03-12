const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Hardcoded permissions from superadmin.js (what UI shows)
const UI_PERMISSIONS_BY_ROLE = {
  'SuperAdmin': 'ALL 47 permissions',
  'Admin': [
    'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_permissions',
    'view_jobs', 'create_jobs', 'edit_jobs', 'delete_jobs', 'approve_jobs', 'publish_jobs',
    'view_candidates', 'edit_candidates', 'manage_candidates', 'restrict_candidates',
    'view_pipeline', 'manage_pipeline', 'view_accounts', 'edit_accounts',
    'view_approvals', 'approve_restrictions', 'reject_restrictions',
    'view_dashboard', 'view_analytics'
  ],
  'HR': [
    'view_jobs', 'view_candidates', 'view_dashboard'
  ],
  'Recruiter': [
    'view_jobs', 'create_jobs', 'edit_jobs', 'view_candidates', 'manage_candidates',
    'send_invites', 'view_pipeline', 'manage_pipeline', 'view_dashboard'
  ],
  'Sales': [
    'view_jobs', 'create_jobs', 'view_candidates', 'view_dashboard'
  ],
  'Interviewer': [
    'view_jobs', 'view_candidates', 'view_dashboard'
  ]
};

async function comparePermissions() {
  try {
    console.log('🔍 Comparing UI Permissions vs Database Permissions\n');
    console.log('='.repeat(80));
    
    // Get all permissions from DB
    const permissions = await pool.query('SELECT * FROM permissions ORDER BY id');
    const permMap = {};
    permissions.rows.forEach(p => {
      permMap[p.id] = p.name;
    });
    
    // Get role_permissions from DB
    const rolePerms = await pool.query(`
      SELECT rp.role, p.name as permission_name, p.description
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      ORDER BY rp.role, p.name
    `);
    
    // Group by role
    const dbPermsByRole = {};
    rolePerms.rows.forEach(row => {
      if (!dbPermsByRole[row.role]) {
        dbPermsByRole[row.role] = [];
      }
      dbPermsByRole[row.role].push(row.permission_name);
    });
    
    // Compare each role
    const roles = ['SuperAdmin', 'Admin', 'HR', 'Recruiter', 'Sales', 'Interviewer'];
    
    for (const role of roles) {
      console.log(`\n📋 Role: ${role}`);
      console.log('-'.repeat(80));
      
      const uiPerms = UI_PERMISSIONS_BY_ROLE[role];
      const dbPerms = dbPermsByRole[role] || [];
      
      if (uiPerms === 'ALL 47 permissions') {
        console.log(`UI Shows: ALL 47 permissions`);
        console.log(`DB Has: ${dbPerms.length} permissions`);
        console.log(`Match: ${dbPerms.length === 27 ? '✅' : '❌'}`);
      } else {
        console.log(`UI Shows: ${uiPerms.length} permissions`);
        console.log(`DB Has: ${dbPerms.length} permissions`);
        
        // Find differences
        const uiOnly = uiPerms.filter(p => !dbPerms.includes(p));
        const dbOnly = dbPerms.filter(p => !uiPerms.includes(p));
        
        if (uiOnly.length > 0) {
          console.log(`\n⚠️  In UI but NOT in DB:`);
          uiOnly.forEach(p => console.log(`   - ${p}`));
        }
        
        if (dbOnly.length > 0) {
          console.log(`\n⚠️  In DB but NOT in UI:`);
          dbOnly.forEach(p => console.log(`   - ${p}`));
        }
        
        if (uiOnly.length === 0 && dbOnly.length === 0) {
          console.log(`✅ Perfect match!`);
        }
      }
      
      console.log(`\nDB Permissions for ${role}:`);
      dbPerms.forEach(p => console.log(`   - ${p}`));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Summary:');
    console.log('The UI shows HARDCODED permissions from superadmin.js');
    console.log('The DB stores actual permissions in role_permissions table');
    console.log('These may NOT match!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

comparePermissions();
