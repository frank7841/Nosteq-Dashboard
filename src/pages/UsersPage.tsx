import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout/Layout';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, Save, X, User as UserIcon, Mail, Shield, Users } from 'lucide-react';
import type { User, RegisterDto } from '../types';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<RegisterDto>({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editData, setEditData] = useState({ fullName: '', email: '', role: 'agent' as 'admin' | 'agent' });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await authService.register(newUser);
      setNewUser({ email: '', password: '', fullName: '' });
      setShowAddForm(false);
      setSuccess('User created successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (error: any) {
      setError(error?.response?.data?.message || error?.message || 'Failed to add user');
    } finally {
      setCreating(false);
    }
  };


  const handleEditUser = async (userId: number) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authService.updateUser(userId, { fullName: editData.fullName, email: editData.email, role: editData.role });
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      setError(error?.response?.data?.message || error?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setDeletingId(userId);
    setError('');
    setSuccess('');
    try {
      await authService.deleteUser(userId);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (error: any) {
      setError(error?.response?.data?.message || error?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const cancelEdit = () => {
    setEditingUser(null);
    setEditData({ fullName: '', email: '', role: 'agent' });
  };

  const startEditing = (u: User) => {
    setEditingUser(u.id);
    setEditData({ fullName: u.fullName, email: u.email, role: u.role });
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center p-8">
            <Shield size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage system users and permissions ({filteredUsers.length} {searchTerm ? 'filtered' : 'total'})
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium touch-manipulation"
            >
              <Plus size={16} />
              Add User
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4 md:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base"
              />
            </div>
          </div>

          {/* Success/Error Messages */}
          {(error || success) && (
            <div className="mb-4 md:mb-6">
              {error && (
                <div className="p-3 md:p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-center gap-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-xs md:text-sm">{error}</span>
                  <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                    <X size={14} />
                  </button>
                </div>
              )}
              {success && (
                <div className="p-3 md:p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg flex items-center gap-2">
                  <Save size={16} className="text-green-500" />
                  <span className="text-xs md:text-sm">{success}</span>
                  <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Create User Form */}
          {showAddForm && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Plus size={18} className="text-green-600" />
                  Add New User
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <UserIcon size={14} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder="Enter full name"
                      required
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Mail size={14} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder="Enter email address"
                      required
                      disabled={creating}
                    />
                  </div>
                </div>
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Shield size={14} />
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="Enter password"
                    required
                    disabled={creating}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium touch-manipulation"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create User
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewUser({ email: '', password: '', fullName: '' });
                    }}
                    disabled={creating}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Users List Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-gray-600" />
                  User Directory
                </h2>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </span>
              </div>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                  <span className="text-sm">Loading users...</span>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <UserIcon size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">
                  {searchTerm ? 'No users match your search' : 'No users found'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Add your first user
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {editingUser === u.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className=" text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <UserIcon size={12} />
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={editData.fullName}
                              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="Full name"
                              disabled={saving}
                            />
                          </div>
                          <div>
                            <label className=" text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <Mail size={12} />
                              Email
                            </label>
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="Email address"
                              disabled={saving}
                            />
                          </div>
                        </div>
                        <div>
                          <label className=" text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Shield size={12} />
                            Role
                          </label>
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'agent' })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            disabled={saving}
                          >
                            <option value="agent">Agent</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleEditUser(u.id)}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium touch-manipulation"
                          >
                            {saving ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={14} />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                              {u.fullName}
                            </h3>
                            <div className="space-y-1 mt-1">
                              <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                                <Mail size={12} className="text-gray-400" />
                                <span className="truncate">{u.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield size={12} className="text-gray-400" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  u.role === 'admin' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {u.role === 'admin' ? 'Administrator' : 'Agent'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => startEditing(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
                            title="Edit user"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deletingId === u.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                            title="Delete user"
                          >
                            {deletingId === u.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};
