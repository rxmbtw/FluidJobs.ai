-- Create Permissions System
-- Phase 1: Database Setup for Role-Based + Custom Permissions

BEGIN;

-- 1. Create permissions table (all available permissions)
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create role_permissions table (default permissions per role)
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission_id)
);

-- 3. Create user_permissions table (custom overrides per user)
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL,
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission_id)
);

-- 4. Insert all available permissions
INSERT INTO permissions (name, description, category) VALUES
-- Job Management
('create_job', 'Create new job postings', 'job_management'),
('edit_job', 'Edit existing job postings', 'job_management'),
('publish_job', 'Publish job postings', 'job_management'),
('approve_job', 'Approve job postings', 'job_management'),
('delete_job', 'Delete job postings', 'job_management'),
('view_jobs', 'View job postings', 'job_management'),

-- Candidate Management
('view_candidates', 'View candidate profiles', 'candidate_management'),
('restrict_candidate', 'Restrict candidate access', 'candidate_management'),
('unrestrict_candidate', 'Unrestrict candidate access', 'candidate_management'),
('manage_candidate_stages', 'Manage candidate interview stages', 'candidate_management'),

-- User Management
('create_users', 'Create new users', 'user_management'),
('edit_users', 'Edit user profiles', 'user_management'),
('delete_users', 'Delete users', 'user_management'),
('view_users', 'View user list', 'user_management'),
('manage_permissions', 'Manage user permissions', 'user_management'),

-- Account Management
('create_accounts', 'Create new accounts', 'account_management'),
('edit_accounts', 'Edit account details', 'account_management'),
('delete_accounts', 'Delete accounts', 'account_management'),
('view_accounts', 'View account list', 'account_management'),

-- Approval Management
('approve_restrictions', 'Approve candidate restrictions', 'approval_management'),
('reject_restrictions', 'Reject candidate restrictions', 'approval_management'),
('override_approvals', 'Override any approval', 'approval_management'),

-- System Management
('view_audit_logs', 'View system audit logs', 'system_management'),
('manage_ai_policies', 'Manage AI policies', 'system_management'),
('system_settings', 'Access system settings', 'system_management'),

-- Dashboard Access
('view_dashboard', 'Access main dashboard', 'dashboard'),
('view_analytics', 'View analytics and reports', 'dashboard')

ON CONFLICT (name) DO NOTHING;

-- 5. Insert default role permissions based on the model
-- SuperAdmin: Full access (all permissions)
INSERT INTO role_permissions (role, permission_id, is_default)
SELECT 'SuperAdmin', id, true FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Admin: Company-level permissions
INSERT INTO role_permissions (role, permission_id, is_default)
SELECT 'Admin', id, true FROM permissions 
WHERE name IN (
  'create_job', 'edit_job', 'publish_job', 'approve_job', 'view_jobs',
  'view_candidates', 'restrict_candidate', 'unrestrict_candidate', 'manage_candidate_stages',
  'create_users', 'edit_users', 'view_users', 'manage_permissions',
  'view_accounts', 'edit_accounts',
  'approve_restrictions', 'reject_restrictions',
  'view_dashboard', 'view_analytics'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Recruiter: Create/Edit JD, Restrict candidates
INSERT INTO role_permissions (role, permission_id, is_default)
SELECT 'Recruiter', id, true FROM permissions 
WHERE name IN (
  'create_job', 'edit_job', 'view_jobs',
  'view_candidates', 'restrict_candidate', 'manage_candidate_stages',
  'view_dashboard'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Sales: Create/Edit JD only
INSERT INTO role_permissions (role, permission_id, is_default)
SELECT 'Sales', id, true FROM permissions 
WHERE name IN (
  'create_job', 'edit_job', 'view_jobs',
  'view_candidates',
  'view_dashboard'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Interviewer: Read-only
INSERT INTO role_permissions (role, permission_id, is_default)
SELECT 'Interviewer', id, true FROM permissions 
WHERE name IN (
  'view_jobs', 'view_candidates', 'view_dashboard'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- HR: Read-only (same as Interviewer)
INSERT INTO role_permissions (role, permission_id, is_default)
SELECT 'HR', id, true FROM permissions 
WHERE name IN (
  'view_jobs', 'view_candidates', 'view_dashboard'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- 7. Add comments for documentation
COMMENT ON TABLE permissions IS 'All available system permissions';
COMMENT ON TABLE role_permissions IS 'Default permissions assigned to each role';
COMMENT ON TABLE user_permissions IS 'Custom permission overrides for individual users';

COMMIT;