-- Migration 027: User-Level Custom Permissions
-- This allows SuperAdmin to customize permissions for individual users
-- Overrides role-based permissions

-- Drop existing objects if they exist
DROP VIEW IF EXISTS user_effective_permissions CASCADE;
DROP FUNCTION IF EXISTS user_has_permission(INTEGER, VARCHAR) CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;

-- Create user_permissions table
CREATE TABLE user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true,
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  UNIQUE(user_id, permission_id)
);

-- Add indexes for performance
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX idx_user_permissions_user_perm ON user_permissions(user_id, permission_id);

-- Add comments
COMMENT ON TABLE user_permissions IS 'Custom permissions for individual users that override role-based permissions';
COMMENT ON COLUMN user_permissions.granted IS 'true = add permission, false = remove permission';
COMMENT ON COLUMN user_permissions.granted_by IS 'User ID of SuperAdmin who granted this permission';
COMMENT ON COLUMN user_permissions.reason IS 'Optional reason for granting/removing this permission';

-- Create view for easy permission checking
CREATE OR REPLACE VIEW user_effective_permissions AS
SELECT DISTINCT
  u.id as user_id,
  u.name as user_name,
  u.role,
  p.id as permission_id,
  p.name as permission_name,
  p.description as permission_description,
  CASE
    -- If user has explicit permission override, use that
    WHEN up.granted IS NOT NULL THEN up.granted
    -- Otherwise, check if role has this permission
    WHEN rp.permission_id IS NOT NULL THEN true
    -- Default: no permission
    ELSE false
  END as has_permission,
  CASE
    WHEN up.granted = true THEN 'custom_added'
    WHEN up.granted = false THEN 'custom_removed'
    WHEN rp.permission_id IS NOT NULL THEN 'from_role'
    ELSE 'not_granted'
  END as permission_source
FROM users u
CROSS JOIN permissions p
LEFT JOIN role_permissions rp ON rp.role = u.role AND rp.permission_id = p.id
LEFT JOIN user_permissions up ON up.user_id = u.id AND up.permission_id = p.id
WHERE u.role IS NOT NULL;

COMMENT ON VIEW user_effective_permissions IS 'Shows effective permissions for each user combining role and custom permissions';

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id INTEGER, p_permission_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  SELECT has_permission INTO v_has_permission
  FROM user_effective_permissions
  WHERE user_id = p_user_id AND permission_name = p_permission_name;
  
  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION user_has_permission(INTEGER, VARCHAR) IS 'Check if a user has a specific permission (considers both role and custom permissions)';

-- Example usage:
-- SELECT user_has_permission(1, 'create_job');
-- SELECT * FROM user_effective_permissions WHERE user_id = 1 AND has_permission = true;
