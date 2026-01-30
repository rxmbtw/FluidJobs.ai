const pool = require('../config/database');

/**
 * Permission checking middleware
 * Checks if user has specific permission based on role defaults + custom overrides
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      if (!userId || !userRole) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // SuperAdmin has all permissions
      if (userRole === 'SuperAdmin') {
        return next();
      }
      
      // Check if user has this specific permission
      const hasPermission = await checkUserPermission(userId, userRole, requiredPermission);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermission 
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Check if user has a specific permission
 * Logic: Role default + User override
 */
async function checkUserPermission(userId, userRole, permissionName) {
  try {
    // Get permission ID
    const permissionResult = await pool.query(
      'SELECT id FROM permissions WHERE name = $1',
      [permissionName]
    );
    
    if (permissionResult.rows.length === 0) {
      console.warn(`Permission '${permissionName}' not found`);
      return false;
    }
    
    const permissionId = permissionResult.rows[0].id;
    
    // Check for user-specific override first
    const userOverride = await pool.query(
      'SELECT is_granted FROM user_permissions WHERE user_id = $1 AND permission_id = $2',
      [userId, permissionId]
    );
    
    if (userOverride.rows.length > 0) {
      return userOverride.rows[0].is_granted;
    }
    
    // Check role default permission
    const rolePermission = await pool.query(
      'SELECT is_default FROM role_permissions WHERE role = $1 AND permission_id = $2',
      [userRole, permissionId]
    );
    
    return rolePermission.rows.length > 0 && rolePermission.rows[0].is_default;
    
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user (role defaults + overrides)
 */
async function getUserPermissions(userId, userRole) {
  try {
    const result = await pool.query(`
      SELECT 
        p.name,
        p.description,
        p.category,
        COALESCE(up.is_granted, rp.is_default, false) as has_permission,
        CASE 
          WHEN up.is_granted IS NOT NULL THEN 'custom'
          WHEN rp.is_default IS NOT NULL THEN 'role_default'
          ELSE 'none'
        END as source
      FROM permissions p
      LEFT JOIN role_permissions rp ON rp.permission_id = p.id AND rp.role = $2
      LEFT JOIN user_permissions up ON up.permission_id = p.id AND up.user_id = $1
      ORDER BY p.category, p.name
    `, [userId, userRole]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Get role default permissions
 */
async function getRolePermissions(role) {
  try {
    const result = await pool.query(`
      SELECT p.name, p.description, p.category, rp.is_default
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role = $1
      ORDER BY p.category, p.name
    `, [role]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting role permissions:', error);
    return [];
  }
}

/**
 * Set custom permission for user
 */
async function setUserPermission(userId, permissionName, isGranted, grantedBy) {
  try {
    // Get permission ID
    const permissionResult = await pool.query(
      'SELECT id FROM permissions WHERE name = $1',
      [permissionName]
    );
    
    if (permissionResult.rows.length === 0) {
      throw new Error(`Permission '${permissionName}' not found`);
    }
    
    const permissionId = permissionResult.rows[0].id;
    
    // Insert or update user permission
    await pool.query(`
      INSERT INTO user_permissions (user_id, permission_id, is_granted, granted_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, permission_id) 
      DO UPDATE SET is_granted = $3, granted_by = $4, granted_at = NOW()
    `, [userId, permissionId, isGranted, grantedBy]);
    
    return true;
  } catch (error) {
    console.error('Error setting user permission:', error);
    throw error;
  }
}

/**
 * Remove custom permission (revert to role default)
 */
async function removeUserPermission(userId, permissionName) {
  try {
    const permissionResult = await pool.query(
      'SELECT id FROM permissions WHERE name = $1',
      [permissionName]
    );
    
    if (permissionResult.rows.length === 0) {
      return false;
    }
    
    const permissionId = permissionResult.rows[0].id;
    
    await pool.query(
      'DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2',
      [userId, permissionId]
    );
    
    return true;
  } catch (error) {
    console.error('Error removing user permission:', error);
    throw error;
  }
}

module.exports = {
  checkPermission,
  checkUserPermission,
  getUserPermissions,
  getRolePermissions,
  setUserPermission,
  removeUserPermission
};