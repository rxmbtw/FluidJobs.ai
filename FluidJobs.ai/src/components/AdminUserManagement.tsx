import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, User, Check, X, Settings } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  assigned_accounts?: number;
  created_at: string;
}

interface Role {
  value: string;
  label: string;
}

interface Permission {
  name: string;
  description: string;
  category: string;
  has_permission: boolean;
  source: string;
}

interface NewUser {
  name: string;
  email: string;
  role: string;
  phone: string;
  useDefaultPermissions: boolean;
  customPermissions: Permission[];
}

interface AdminUserManagementProps {
  isCompanyDashboard?: boolean;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ isCompanyDashboard = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [newUser, setNewUser] = useState<NewUser>({ name: '', email: '', role: '', phone: '', useDefaultPermissions: true, customPermissions: [] });
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', response.status);
        setShowErrorMessage('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setShowErrorMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailError('');
      return;
    }

    setCheckingEmail(true);
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const endpoint = isCompanyDashboard ? '/api/admin/users/check-email' : '/api/auth/check-username';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(isCompanyDashboard ? { email } : { username: email })
      });
      const data = await response.json();
      
      if (data.exists) {
        setEmailError('This email is already registered.');
      } else {
        setEmailError('');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      console.log('Fetching available roles with token:', token ? 'Present' : 'Missing');
      
      // Use different endpoint based on dashboard type
      const endpoint = isCompanyDashboard ? '/api/auth/available-roles' : '/api/admin/available-roles';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Available roles response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Available roles data:', data);
        setAvailableRoles(data);
      } else {
        console.error('Failed to fetch roles:', response.status, await response.text());
        // Fallback roles for company dashboard
        if (isCompanyDashboard) {
          setAvailableRoles([
            { value: 'Admin', label: 'Admin' },
            { value: 'Recruiter', label: 'Recruiter' },
            { value: 'HR', label: 'HR' },
            { value: 'Interviewer', label: 'Interviewer' }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback roles for company dashboard
      if (isCompanyDashboard) {
        setAvailableRoles([
          { value: 'Admin', label: 'Admin' },
          { value: 'Recruiter', label: 'Recruiter' },
          { value: 'HR', label: 'HR' },
          { value: 'Interviewer', label: 'Interviewer' }
        ]);
      }
    }
  };

  const fetchRolePermissions = async (role: string) => {
    if (!role) {
      setRolePermissions([]);
      return;
    }
    
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      console.log('Fetching role permissions for:', role);
      
      // Use different endpoint based on dashboard type
      const endpoint = isCompanyDashboard ? `/api/auth/roles/${role}/permissions` : `/api/admin/roles/${role}/permissions`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Role permissions response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Role permissions data:', data);
        setRolePermissions(data.permissions);
        setNewUser(prev => ({ ...prev, customPermissions: data.permissions }));
      } else {
        console.error('Failed to fetch role permissions:', response.status, await response.text());
        // For company dashboard, show basic permissions structure
        if (isCompanyDashboard) {
          const basicPermissions = [
            { name: 'view_jobs', description: 'View Jobs', category: 'jobs', has_permission: true, source: 'role' },
            { name: 'create_jobs', description: 'Create Jobs', category: 'jobs', has_permission: role === 'Admin' || role === 'Recruiter', source: 'role' },
            { name: 'view_candidates', description: 'View Candidates', category: 'candidates', has_permission: true, source: 'role' },
            { name: 'manage_candidates', description: 'Manage Candidates', category: 'candidates', has_permission: role === 'Admin' || role === 'HR', source: 'role' }
          ];
          setRolePermissions(basicPermissions);
          setNewUser(prev => ({ ...prev, customPermissions: basicPermissions }));
        }
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      // For company dashboard, show basic permissions structure
      if (isCompanyDashboard) {
        const basicPermissions = [
          { name: 'view_jobs', description: 'View Jobs', category: 'jobs', has_permission: true, source: 'role' },
          { name: 'create_jobs', description: 'Create Jobs', category: 'jobs', has_permission: role === 'Admin' || role === 'Recruiter', source: 'role' },
          { name: 'view_candidates', description: 'View Candidates', category: 'candidates', has_permission: true, source: 'role' },
          { name: 'manage_candidates', description: 'Manage Candidates', category: 'candidates', has_permission: role === 'Admin' || role === 'HR', source: 'role' }
        ];
        setRolePermissions(basicPermissions);
        setNewUser(prev => ({ ...prev, customPermissions: basicPermissions }));
      }
    }
  };

  const handleRoleChange = (role: string) => {
    setNewUser(prev => ({ ...prev, role }));
    fetchRolePermissions(role);
  };

  const handlePermissionToggle = (permissionName: string, granted: boolean) => {
    setNewUser(prev => ({
      ...prev,
      customPermissions: prev.customPermissions.map(perm =>
        perm.name === permissionName
          ? { ...perm, has_permission: granted }
          : perm
      )
    }));
  };

  const fetchUserPermissions = async (userId: number) => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      
      // Use different endpoint based on dashboard type
      const endpoint = isCompanyDashboard ? '/api/auth/users' : '/api/admin/users';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          useDefaultPermissions: newUser.useDefaultPermissions,
          customPermissions: newUser.useDefaultPermissions ? undefined : newUser.customPermissions
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowSuccessMessage(`User created successfully! Temporary password: ${data.tempPassword}`);
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', role: '', phone: '', useDefaultPermissions: true, customPermissions: [] });
        setRolePermissions([]);
        fetchUsers();
      } else {
        const error = await response.json();
        setShowErrorMessage(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setShowErrorMessage('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch(`/api/admin/users/${selectedUser?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedUser)
      });
      
      if (response.ok) {
        setShowSuccessMessage('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        setShowErrorMessage(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setShowErrorMessage('Failed to update user');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
    
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setShowSuccessMessage('User deleted successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        setShowErrorMessage(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setShowErrorMessage('Failed to delete user');
    }
  };

  const handleManagePermissions = async (user: User) => {
    setSelectedUser(user);
    await fetchUserPermissions(user.id);
    setShowPermissionsModal(true);
  };

  const handlePermissionChange = (permissionName: string, granted: boolean) => {
    setUserPermissions(prev => 
      prev.map(perm => 
        perm.name === permissionName 
          ? { ...perm, has_permission: granted }
          : perm
      )
    );
  };

  const handleSavePermissions = async () => {
    try {
      const permissions = userPermissions.map(perm => ({
        name: perm.name,
        granted: perm.has_permission
      }));

      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch(`/api/admin/users/${selectedUser?.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });
      
      if (response.ok) {
        setShowSuccessMessage('Permissions updated successfully');
        setShowPermissionsModal(false);
      } else {
        const error = await response.json();
        setShowErrorMessage(error.error || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      setShowErrorMessage('Failed to update permissions');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const groupedPermissions = userPermissions.reduce((acc: Record<string, Permission[]>, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  const getRoleColor = (role: string) => {
    const colors = {
      'SuperAdmin': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-blue-100 text-blue-800',
      'Recruiter': 'bg-green-100 text-green-800',
      'Sales': 'bg-orange-100 text-orange-800',
      'Interviewer': 'bg-gray-100 text-gray-800',
      'HR': 'bg-pink-100 text-pink-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage users and their permissions</p>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToCreateUser'))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          {availableRoles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Accounts</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {user.assigned_accounts || 0} accounts
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleManagePermissions(user)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Manage Permissions"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-700 p-1"
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <div className="flex justify-between items-center">
            <span>{showSuccessMessage}</span>
            <button onClick={() => setShowSuccessMessage('')}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {showErrorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex justify-between items-center">
            <span>{showErrorMessage}</span>
            <button onClick={() => setShowErrorMessage('')}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;