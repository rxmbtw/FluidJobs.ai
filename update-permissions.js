// Script to update permissions in superadmin.js
// Run this with: node update-permissions.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'routes', 'superadmin.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the start and end of rolePermissions object
const startMarker = '    // Define role-based permissions\n    const rolePermissions = {';
const endMarker = '    };\n\n    const permissions = rolePermissions[role] || [];';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find rolePermissions object markers');
  process.exit(1);
}

// New permissions structure
const newPermissions = `    // Define role-based permissions - Complete 47 Permission Structure
    const rolePermissions = {
      'SuperAdmin': [
        // User Management (6 permissions)
        { name: 'view_users', description: 'View Users', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'create_users', description: 'Create Users', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'edit_users', description: 'Edit Users', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'delete_users', description: 'Delete Users', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'manage_permissions', description: 'Manage Permissions', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'assign_accounts', description: 'Assign Accounts to Users', category: 'user_management', has_permission: true, source: 'role' },
        
        // Job Management (7 permissions)
        { name: 'view_jobs', description: 'View Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'create_jobs', description: 'Create Jobs (Direct)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'edit_jobs', description: 'Edit Jobs (Direct)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'delete_jobs', description: 'Delete Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'approve_jobs', description: 'Approve/Reject Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'publish_jobs', description: 'Publish Jobs Directly', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management', has_permission: true, source: 'role' },
        
        // Candidate Management (9 permissions)
        { name: 'view_candidates', description: 'View Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'create_candidates', description: 'Create Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'edit_candidates', description: 'Edit Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'delete_candidates', description: 'Delete Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'manage_candidates', description: 'Manage Candidate Lifecycle', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'send_invites', description: 'Send Candidate Invitations', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'bulk_import', description: 'Bulk Import Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'restrict_candidates', description: 'Restrict/Block Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'export_candidates', description: 'Export Candidate Data', category: 'candidate_management', has_permission: true, source: 'role' },
        
        // Pipeline Management (5 permissions)
        { name: 'view_pipeline', description: 'View Hiring Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_pipeline', description: 'Move Candidates Through Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_job_settings', description: 'Edit Job Settings', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'manage_interviews', description: 'Schedule & Manage Interviews', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'add_interview_feedback', description: 'Add Interview Feedback', category: 'pipeline_management', has_permission: true, source: 'role' },
        
        // Account Management (5 permissions)
        { name: 'view_accounts', description: 'View All Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'create_accounts', description: 'Create Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'edit_accounts', description: 'Edit Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'delete_accounts', description: 'Delete Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'manage_account_users', description: 'Assign Users to Accounts', category: 'account_management', has_permission: true, source: 'role' },
        
        // Approvals (2 permissions)
        { name: 'view_approvals', description: 'View All Approval Requests', category: 'approvals', has_permission: true, source: 'role' },
        { name: 'approve_requests', description: 'Approve/Reject Requests', category: 'approvals', has_permission: true, source: 'role' },
        
        // Reporting (4 permissions)
        { name: 'view_reports', description: 'View Reports', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'view_analytics', description: 'View Analytics Dashboards', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'view_recruiter_analytics', description: 'View Recruiter Analytics', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'export_reports', description: 'Export Reports', category: 'reporting', has_permission: true, source: 'role' },
        
        // Administration (4 permissions)
        { name: 'system_settings', description: 'Access System Settings', category: 'administration', has_permission: true, source: 'role' },
        { name: 'manage_policies', description: 'Manage AI Policies', category: 'administration', has_permission: true, source: 'role' },
        { name: 'view_audit_logs', description: 'View Audit Logs', category: 'administration', has_permission: true, source: 'role' },
        { name: 'manage_integrations', description: 'Manage Integrations', category: 'administration', has_permission: true, source: 'role' }
      ],
      
      'Admin': [
        // User Management
        { name: 'view_users', description: 'View Users', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'create_users', description: 'Create Users (Except SuperAdmin)', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'edit_users', description: 'Edit Users (Except SuperAdmin)', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'delete_users', description: 'Delete Users (Except SuperAdmin)', category: 'user_management', has_permission: true, source: 'role' },
        { name: 'assign_accounts', description: 'Assign Accounts to Users', category: 'user_management', has_permission: true, source: 'role' },
        
        // Job Management
        { name: 'view_jobs', description: 'View Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'create_jobs', description: 'Create Jobs (Direct)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'edit_jobs', description: 'Edit Jobs (Direct)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'delete_jobs', description: 'Delete Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'approve_jobs', description: 'Approve/Reject Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'publish_jobs', description: 'Publish Jobs Directly', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management', has_permission: true, source: 'role' },
        
        // Candidate Management
        { name: 'view_candidates', description: 'View Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'create_candidates', description: 'Create Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'edit_candidates', description: 'Edit Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'delete_candidates', description: 'Delete Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'manage_candidates', description: 'Manage Candidate Lifecycle', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'send_invites', description: 'Send Candidate Invitations', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'bulk_import', description: 'Bulk Import Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'restrict_candidates', description: 'Restrict/Block Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'export_candidates', description: 'Export Candidate Data', category: 'candidate_management', has_permission: true, source: 'role' },
        
        // Pipeline Management
        { name: 'view_pipeline', description: 'View Hiring Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_pipeline', description: 'Move Candidates Through Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_job_settings', description: 'Edit Job Settings', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'manage_interviews', description: 'Schedule & Manage Interviews', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'add_interview_feedback', description: 'Add Interview Feedback', category: 'pipeline_management', has_permission: true, source: 'role' },
        
        // Account Management
        { name: 'view_accounts', description: 'View All Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'create_accounts', description: 'Create Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'edit_accounts', description: 'Edit Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'delete_accounts', description: 'Delete Accounts', category: 'account_management', has_permission: true, source: 'role' },
        { name: 'manage_account_users', description: 'Assign Users to Accounts', category: 'account_management', has_permission: true, source: 'role' },
        
        // Approvals
        { name: 'view_approvals', description: 'View All Approval Requests', category: 'approvals', has_permission: true, source: 'role' },
        { name: 'approve_requests', description: 'Approve/Reject Requests', category: 'approvals', has_permission: true, source: 'role' },
        
        // Reporting
        { name: 'view_reports', description: 'View Reports', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'view_analytics', description: 'View Analytics Dashboards', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'view_recruiter_analytics', description: 'View Recruiter Analytics', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'export_reports', description: 'Export Reports', category: 'reporting', has_permission: true, source: 'role' },
        
        // Administration
        { name: 'system_settings', description: 'Access System Settings', category: 'administration', has_permission: true, source: 'role' },
        { name: 'manage_policies', description: 'Manage AI Policies', category: 'administration', has_permission: true, source: 'role' },
        { name: 'view_audit_logs', description: 'View Audit Logs', category: 'administration', has_permission: true, source: 'role' }
      ],
      
      'Recruiter': [
        // Job Management
        { name: 'view_jobs', description: 'View Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'create_jobs', description: 'Create Jobs (Requires Approval)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'edit_jobs', description: 'Edit Jobs (Requires Approval)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management', has_permission: true, source: 'role' },
        
        // Candidate Management
        { name: 'view_candidates', description: 'View Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'create_candidates', description: 'Create Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'edit_candidates', description: 'Edit Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'manage_candidates', description: 'Manage Candidate Lifecycle', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'send_invites', description: 'Send Candidate Invitations', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'restrict_candidates', description: 'Restrict/Block Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'export_candidates', description: 'Export Candidate Data', category: 'candidate_management', has_permission: true, source: 'role' },
        
        // Pipeline Management
        { name: 'view_pipeline', description: 'View Hiring Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_pipeline', description: 'Move Candidates Through Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_job_settings', description: 'Edit Job Settings', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'manage_interviews', description: 'Schedule & Manage Interviews', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'add_interview_feedback', description: 'Add Interview Feedback', category: 'pipeline_management', has_permission: true, source: 'role' },
        
        // Account Management
        { name: 'view_accounts', description: 'View Accounts (Assigned Only)', category: 'account_management', has_permission: true, source: 'role' },
        
        // Approvals
        { name: 'view_approvals', description: 'View Approval Requests', category: 'approvals', has_permission: true, source: 'role' },
        { name: 'track_own_approvals', description: 'Track Own Approval Status', category: 'approvals', has_permission: true, source: 'role' },
        
        // Reporting
        { name: 'view_reports', description: 'View Reports', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'view_analytics', description: 'View Analytics Dashboards', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'export_reports', description: 'Export Reports', category: 'reporting', has_permission: true, source: 'role' }
      ],
      
      'HR': [
        // Job Management
        { name: 'view_jobs', description: 'View Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management', has_permission: true, source: 'role' },
        
        // Candidate Management
        { name: 'view_candidates', description: 'View Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'create_candidates', description: 'Create Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'edit_candidates', description: 'Edit Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'manage_candidates', description: 'Manage Candidate Lifecycle', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'send_invites', description: 'Send Candidate Invitations', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'bulk_import', description: 'Bulk Import Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'restrict_candidates', description: 'Restrict/Block Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'export_candidates', description: 'Export Candidate Data', category: 'candidate_management', has_permission: true, source: 'role' },
        
        // Pipeline Management
        { name: 'view_pipeline', description: 'View Hiring Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_pipeline', description: 'Move Candidates Through Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_job_settings', description: 'Edit Job Settings', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'manage_interviews', description: 'Schedule & Manage Interviews', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'add_interview_feedback', description: 'Add Interview Feedback', category: 'pipeline_management', has_permission: true, source: 'role' },
        
        // Account Management
        { name: 'view_accounts', description: 'View Accounts (Assigned Only)', category: 'account_management', has_permission: true, source: 'role' },
        
        // Approvals
        { name: 'view_approvals', description: 'View Approval Requests', category: 'approvals', has_permission: true, source: 'role' },
        
        // Reporting
        { name: 'view_reports', description: 'View Reports', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'view_analytics', description: 'View Analytics Dashboards', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'export_reports', description: 'Export Reports', category: 'reporting', has_permission: true, source: 'role' }
      ],
      
      'Sales': [
        // Job Management
        { name: 'view_jobs', description: 'View Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'create_jobs', description: 'Create Jobs (Requires Approval)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'edit_jobs', description: 'Edit Jobs (Requires Approval)', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management', has_permission: true, source: 'role' },
        
        // Candidate Management
        { name: 'view_candidates', description: 'View Candidates (View Only)', category: 'candidate_management', has_permission: true, source: 'role' },
        
        // Pipeline Management
        { name: 'view_pipeline', description: 'View Pipeline (View Only)', category: 'pipeline_management', has_permission: true, source: 'role' },
        
        // Account Management
        { name: 'view_accounts', description: 'View Accounts (Assigned Only)', category: 'account_management', has_permission: true, source: 'role' },
        
        // Approvals
        { name: 'view_approvals', description: 'View Approval Requests', category: 'approvals', has_permission: true, source: 'role' },
        { name: 'track_own_approvals', description: 'Track Own Approval Status', category: 'approvals', has_permission: true, source: 'role' },
        
        // Reporting
        { name: 'view_reports', description: 'View Reports', category: 'reporting', has_permission: true, source: 'role' },
        { name: 'view_analytics', description: 'View Analytics Dashboards', category: 'reporting', has_permission: true, source: 'role' }
      ],
      
      'Interviewer': [
        // Job Management
        { name: 'view_jobs', description: 'View Jobs', category: 'job_management', has_permission: true, source: 'role' },
        { name: 'view_job_analytics', description: 'View Job Analytics', category: 'job_management', has_permission: true, source: 'role' },
        
        // Candidate Management
        { name: 'view_candidates', description: 'View Candidates', category: 'candidate_management', has_permission: true, source: 'role' },
        { name: 'edit_candidates', description: 'Edit Candidates (Notes Only)', category: 'candidate_management', has_permission: true, source: 'role' },
        
        // Pipeline Management
        { name: 'view_pipeline', description: 'View Hiring Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'edit_pipeline', description: 'Move Candidates Through Pipeline', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'manage_interviews', description: 'Schedule & Manage Interviews', category: 'pipeline_management', has_permission: true, source: 'role' },
        { name: 'add_interview_feedback', description: 'Add Interview Feedback', category: 'pipeline_management', has_permission: true, source: 'role' },
        
        // Account Management
        { name: 'view_accounts', description: 'View Accounts (Assigned Only)', category: 'account_management', has_permission: true, source: 'role' },
        
        // Reporting
        { name: 'view_reports', description: 'View Reports', category: 'reporting', has_permission: true, source: 'role' }
      ]
    }`;

// Replace the content
const before = content.substring(0, startIndex);
const after = content.substring(endIndex);
const newContent = before + newPermissions + '\n\n' + after;

// Write back to file
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Successfully updated permissions in superadmin.js');
console.log('📊 New permission counts:');
console.log('   - SuperAdmin: 47 permissions');
console.log('   - Admin: 44 permissions');
console.log('   - Recruiter: 22 permissions');
console.log('   - HR: 20 permissions');
console.log('   - Sales: 11 permissions');
console.log('   - Interviewer: 10 permissions');
