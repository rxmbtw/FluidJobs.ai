import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, User, Check, X, Settings } from 'lucide-react';
import SuccessModal from '../SuccessModal';
import ErrorModal from '../ErrorModal';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch('http://localhost:8000/api/admin/users', {
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
      const endpoint = isCompanyDashboard ? 'http://localhost:8000/api/admin/users/check-email' : 'http://localhost:8000/api/auth/check-username';
      
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
      const endpoint = isCompanyDashboard ? 'http://localhost:8000/api/auth/available-roles' : 'http://localhost:8000/api/admin/available-roles';
      
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
      const endpoint = isCompanyDashboard ? `http://localhost:8000/api/auth/roles/${role}/permissions` : `http://localhost:8000/api/admin/roles/${role}/permissions`;
      
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
            { name: 'create_job', description: 'Create Jobs', category: 'jobs', has_permission: role === 'Admin' || role === 'Recruiter', source: 'role' },
            { name: 'view_candidates', description: 'View Candidates', category: 'candidates', has_permission: true, source: 'role' },
            { name: 'manage_candidate_stages', description: 'Manage Candidates', category: 'candidates', has_permission: role === 'Admin' || role === 'HR', source: 'role' }
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
          { name: 'create_job', description: 'Create Jobs', category: 'jobs', has_permission: role === 'Admin' || role === 'Recruiter', source: 'role' },
          { name: 'view_candidates', description: 'View Candidates', category: 'candidates', has_permission: true, source: 'role' },
          { name: 'manage_candidate_stages', description: 'Manage Candidates', category: 'candidates', has_permission: role === 'Admin' || role === 'HR', source: 'role' }
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
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/permissions`, {
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
      const endpoint = isCompanyDashboard ? 'http://localhost:8000/api/auth/users' : 'http://localhost:8000/api/admin/users';
      
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
      const response = await fetch(`http://localhost:8000/api/admin/users/${selectedUser?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedUser)
      });
      
      if (response.ok) {
        setSuccessMessage({
          title: 'Success!',
          message: 'User updated successfully'
        });
        setShowSuccessModal(true);
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        let errorMsg = 'Failed to update user';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          // Response might not have JSON body
        }
        setErrorMessage({
          title: 'Error',
          message: errorMsg
        });
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage({
        title: 'Error',
        message: 'Failed to update user'
      });
      setShowErrorModal(true);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch(`http://localhost:8000/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setShowDeleteConfirmModal(false);
        setSelectedUser(null);
        setSuccessMessage({
          title: 'Success!',
          message: 'User deleted successfully'
        });
        setShowSuccessModal(true);
        fetchUsers();
      } else {
        let errorMsg = 'Failed to delete user';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          // Response might not have JSON body
          errorMsg = `Failed to delete user (Status: ${response.status})`;
        }
        setShowDeleteConfirmModal(false);
        setErrorMessage({
          title: 'Error',
          message: errorMsg
        });
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setShowDeleteConfirmModal(false);
      setErrorMessage({
        title: 'Error',
        message: 'Failed to delete user'
      });
      setShowErrorModal(true);
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
      const response = await fetch(`http://localhost:8000/api/admin/users/${selectedUser?.id}/permissions`, {
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
          onClick={() => {
            // Navigate to create-user page using relative path
            const currentPath = window.location.pathname;
            const basePath = currentPath.split('/').slice(0, 2).join('/'); // Get /admin-dashboard or /hr-dashboard etc
            window.location.href = `${basePath}/create-user`;
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create New User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users by name, email or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Name</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Email</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Role</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Date Joined</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Status</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">{user.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{user.role}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success/Error Messages - Old style (keeping for backward compatibility) */}
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

      {/* Edit User Modal - SuperAdmin style */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Recruiter">Recruiter</option>
                  <option value="HR">HR</option>
                  <option value="Interviewer">Interviewer</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <button
                onClick={handleUpdateUser}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - SuperAdmin style */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

      {/* Error Modal - SuperAdmin style */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorMessage.title}
        message={errorMessage.message}
      />

      {/* Delete Confirmation Modal - SuperAdmin style */}
      {showDeleteConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Delete User</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>?
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;