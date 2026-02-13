import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const [userRole, setUserRole] = useState('');
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Roles that should see permissions view instead of settings
  const permissionsViewRoles = ['Sales', 'HR', 'Recruiter', 'Interviewer'];

  useEffect(() => {
    // Get user role from session
    const userStr = sessionStorage.getItem('fluidjobs_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || '');
        
        // Fetch user permissions if they should see permissions view
        if (permissionsViewRoles.includes(user.role)) {
          fetchUserPermissions(user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserPermissions = async (userId: number) => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch(`http://localhost:8000/api/auth/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw permissions data:', data); // Debug log
        
        // Filter to show ONLY assigned permissions (where has_permission is true)
        // The backend returns all permissions with has_permission field
        const assignedPermissions = (data.permissions || []).filter((p: any) => {
          return p.has_permission === true;
        });
        
        console.log('Filtered assigned permissions:', assignedPermissions); // Debug log
        console.log('Total permissions:', data.permissions?.length, 'Assigned:', assignedPermissions.length);
        setUserPermissions(assignedPermissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by category
  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: any[] } = {};
    userPermissions.forEach(permission => {
      const category = permission.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format permission name for display
  const formatPermissionName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // If user should see permissions view
  if (permissionsViewRoles.includes(userRole)) {
    if (loading) {
      return (
        <DashboardLayout>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      );
    }

    const groupedPermissions = groupPermissionsByCategory();

    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">My Permissions</h1>
              </div>
              <p className="text-sm text-gray-600">
                View your assigned permissions for the <span className="font-semibold text-indigo-600">{userRole}</span> role
              </p>
            </div>

            {/* Permissions Summary */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-indigo-900">
                  You have {userPermissions.length} assigned permission{userPermissions.length !== 1 ? 's' : ''}
                </h3>
              </div>
              <p className="text-sm text-indigo-700">
                These permissions define what actions you can perform in the system. Contact your administrator if you need additional access.
              </p>
            </div>

            {/* Permissions by Category */}
            {Object.keys(groupedPermissions).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        {formatCategoryName(category)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {permissions.length} permission{permissions.length !== 1 ? 's' : ''} in this category
                      </p>
                    </div>

                    {/* Permissions List */}
                    <div className="divide-y divide-gray-200">
                      {permissions.map((permission: any) => (
                        <div key={permission.name} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {formatPermissionName(permission.name)}
                              </h4>
                              {permission.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No permissions assigned yet</p>
                <p className="text-sm text-gray-400 mt-1">Contact your administrator for access</p>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Need More Access?</h4>
              <p className="text-sm text-blue-700">
                If you need additional permissions to perform your job duties, please contact your system administrator or account manager.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Default settings view for Admin and SuperAdmin
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          
          <div className="space-y-6">
            {/* Notifications */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Email notifications for new applications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">SMS notifications for urgent updates</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2 text-sm text-gray-700">Weekly summary reports</span>
                </label>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Make profile visible to other departments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2 text-sm text-gray-700">Allow data export</span>
                </label>
              </div>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                Change Password
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;