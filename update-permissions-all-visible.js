const fs = require('fs');
const path = require('path');

// Master list of ALL 47 permissions
const ALL_PERMISSIONS = [
  // User Management (6)
  { name: 'view_users', description: 'View Users', category: 'user_management' },
  { name: 'create_users', description: 'Create Users', category: 'user_management' },
  { name: 'edit_users', description: 'Edit Users', category: 'user_management' },
  { name: 'delete_users', description: 'Delete Users', category: 'user_management' },
  { name: 'manage_permissions', description: 'Manage Permissions', category: 'user_management' },
  { name: 'assign_accounts', description: 'Assign Accounts to Users', category: 'user_management' },
  
  // Job Management (7)
  { name: 'view_jobs', description: 'View Jobs', category: 'job_management' },
  { name: 'create_jobs', description: 'Create Jobs', category: 'job_management' },
  { name: 'edit_jobs', description: 'Edit Jobs', category: 'job_management' },
  { name: 'delete_jobs', description: 'Delete Jobs', category: 'job_management' },
  { name: 'approve_jobs', description: 'Approve/Reject Jobs', category: 'job_management' },
  { name: 'publish_jobs', description: 'Publish Jobs', category: 'job_management' },
  { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management' },
  
  // Candidate Management (9)
  { name: 'view_candidates', description: 'View Candidates', category: 'candidate_management' },
  { name: 'create_candidates', description: 'Create Candidates', category: 'candidate_management' },
  { name: 'edit_candidates', description: 'Edit Candidates', category: 'candidate_management' },
  { name: 'delete_candidates', description: 'Delete Candidates', category: 'candidate_management' },
  { name: 'manage_candidates', description: 'Manage Candidate Lifecycle', category: 'candidate_management' },
  { name: 'send_invites', description: 'Send Candidate Invitations', category: 'candidate_management' },
  { name: 'bulk_import', description: 'Bulk Import Candidates', category: 'candidate_management' },
  { name: 'restrict_candidates', description: 'Restrict/Block Candidates', category: 'candidate_management' },
  { name: 'export_candidates', description: 'Export Candidate Data', category: 'candidate_management' },
  
  // Pipeline Management (5)
  { name: 'view_pipeline', description: 'View Hiring Pipeline', category: 'pipeline_management' },
  { name: 'edit_pipeline', description: 'Move Candidates Through Pipeline', category: 'pipeline_management' },
  { name: 'edit_job_settings', description: 'Edit Job Settings', category: 'pipeline_management' },
  { name: 'manage_interviews', description: 'Schedule & Manage Interviews', category: 'pipeline_management' },
  { name: 'add_interview_feedback', description: 'Add Interview Feedback', category: 'pipeline_management' },
  
  // Account Management (5)
  { name: 'view_accounts', description: 'View Accounts', category: 'account_management' },
  { name: 'create_accounts', description: 'Create Accounts', category: 'account_management' },
  { name: 'edit_accounts', description: 'Edit Accounts', category: 'account_management' },
  { name: 'delete_accounts', description: 'Delete Accounts', category: 'account_management' },
  { name: 'manage_account_users', description: 'Assign Users to Accounts', category: 'account_management' },
  
  // Approvals (3)
  { name: 'view_approvals', description: 'View Approval Requests', category: 'approvals' },
  { name: 'approve_requests', description: 'Approve/Reject Requests', category: 'approvals' },
  { name: 'track_own_approvals', description: 'Track Own Approval Status', category: 'approvals' },
  
  // Reporting (4)
  { name: 'view_reports', description: 'View Reports', category: 'reporting' },
  { name: 'view_analytics', description: 'View Analytics Dashboards', category: 'reporting' },
  { name: 'view_recruiter_analytics', description: 'View Recruiter Analytics', category: 'reporting' },
  { name: 'export_reports', description: 'Export Reports', category: 'reporting' },
  
  // Administration (4)
  { name: 'system_settings', description: 'Access System Settings', category: 'administration' },
  { name: 'manage_policies', description: 'Manage AI Policies', category: 'administration' },
  { name: 'view_audit_logs', description: 'View Audit Logs', category: 'administration' },
  { name: 'manage_integrations', description: 'Manage Integrations', category: 'administration' }
];

// Define which permissions each role has by default
const ROLE_DEFAULTS = {
  'SuperAdmin': [
    'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_permissions', 'assign_accounts',
    'view_jobs', 'create_jobs', 'edit_jobs', 'delete_jobs', 'approve_jobs', 'publish_jobs', 'view_job_analytics',
    'view_candidates', 'create_candidates', 'edit_candidates', 'delete_candidates', 'manage_candidates', 'send_invites', 'bulk_import', 'restrict_candidates', 'export_candidates',
    'view_pipeline', 'edit_pipeline', 'edit_job_settings', 'manage_interviews', 'add_interview_feedback',
    'view_accounts', 'create_accounts', 'edit_accounts', 'delete_accounts', 'manage_account_users',
    'view_approvals', 'approve_requests', 'track_own_approvals',
    'view_reports', 'view_analytics', 'view_recruiter_analytics', 'export_reports',
    'system_settings', 'manage_policies', 'view_audit_logs', 'manage_integrations'
  ],
  'Admin': [
    'view_users', 'create_users', 'edit_users', 'delete_users', 'assign_accounts',
    'view_jobs', 'create_jobs', 'edit_jobs', 'delete_jobs', 'approve_jobs', 'publish_jobs', 'view_job_analytics',
    'view_candidates', 'create_candidates', 'edit_candidates', 'delete_candidates', 'manage_candidates', 'send_invites', 'bulk_import', 'restrict_candidates', 'export_candidates',
    'view_pipeline', 'edit_pipeline', 'edit_job_settings', 'manage_interviews', 'add_interview_feedback',
    'view_accounts', 'create_accounts', 'edit_accounts', 'delete_accounts', 'manage_account_users',
    'view_approvals', 'approve_requests',
    'view_reports', 'view_analytics', 'view_recruiter_analytics', 'export_reports',
    'system_settings', 'manage_policies', 'view_audit_logs'
  ],
  'Recruiter': [
    'view_jobs', 'create_jobs', 'edit_jobs', 'view_job_analytics',
    'view_candidates', 'create_candidates', 'edit_candidates', 'manage_candidates', 'send_invites', 'restrict_candidates', 'export_candidates',
    'view_pipeline', 'edit_pipeline', 'edit_job_settings', 'manage_interviews', 'add_interview_feedback',
    'view_accounts',
    'view_approvals', 'track_own_approvals',
    'view_reports', 'view_analytics', 'export_reports'
  ],
  'HR': [
    'view_jobs', 'view_job_analytics',
    'view_candidates', 'create_candidates', 'edit_candidates', 'manage_candidates', 'send_invites', 'bulk_import', 'restrict_candidates', 'export_candidates',
    'view_pipeline', 'edit_pipeline', 'edit_job_settings', 'manage_interviews', 'add_interview_feedback',
    'view_accounts',
    'view_approvals',
    'view_reports', 'view_analytics', 'export_reports'
  ],
  'Sales': [
    'view_jobs', 'create_jobs', 'edit_jobs', 'view_job_analytics',
    'view_candidates',
    'view_pipeline',
    'view_accounts',
    'view_approvals', 'track_own_approvals',
    'view_reports', 'view_analytics'
  ],
  'Interviewer': [
    'view_jobs', 'view_job_analytics',
    'view_candidates', 'edit_candidates',
    'view_pipeline', 'edit_pipeline', 'manage_interviews', 'add_interview_feedback',
    'view_accounts',
    'view_reports'
  ]
};

// Generate the new route code
const generateRouteCode = () => {
  return `// Get role permissions for SuperAdmin - ALL PERMISSIONS VISIBLE
router.get('/roles/:role/permissions', async (req, res) => {
  try {
    const { role } = req.params;

    // Master list of ALL 47 permissions
    const allPermissions = ${JSON.stringify(ALL_PERMISSIONS, null, 6)};

    // Get default permissions for this role
    const roleDefaults = ${JSON.stringify(ROLE_DEFAULTS, null, 6)};

    const defaultPerms = roleDefaults[role] || [];

    // Return ALL permissions with has_permission flag
    const permissions = allPermissions.map(perm => ({
      ...perm,
      has_permission: defaultPerms.includes(perm.name),
      source: 'role'
    }));

    res.json({
      role: role,
      permissions: permissions
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: error.message });
  }
});`;
};

// Read current file
const filePath = path.join(__dirname, 'backend/routes/superadmin.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the route
const startMarker = '// Get role permissions for SuperAdmin';
const endMarker = '// Create New User';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('❌ Could not find markers!');
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);
const newContent = before + generateRouteCode() + '\n\n' + after;

// Backup
fs.writeFileSync(filePath + '.backup-all-perms', content, 'utf8');

// Write new content
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Updated to show ALL 47 permissions for every role!');
console.log('');
console.log('Now when selecting a role:');
console.log('  ✅ Checked = Default permissions for that role');
console.log('  ☐ Unchecked = Can be manually added');
console.log('');
console.log('📝 Backup: backend/routes/superadmin.js.backup-all-perms');
