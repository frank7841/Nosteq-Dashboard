import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import type { User, RegisterDto } from '../types';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<RegisterDto>({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editData, setEditData] = useState({ fullName: '', email: '', role: 'agent' as 'admin' | 'agent' });

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
    try {
      await authService.register(newUser);
      setNewUser({ email: '', password: '', fullName: '' });
      setShowAddForm(false);
      loadUsers();
    } catch (error) {
      setError('Failed to add user');
    }
  };


  const handleEditUser = async (userId: number) => {
    try {
      await authService.updateUser(userId, { fullName: editData.fullName, email: editData.email, role: editData.role });
      loadUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await authService.deleteUser(userId);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const startEditing = (u: User) => {
    setEditingUser(u.id);
    setEditData({ fullName: u.fullName, email: u.email, role: u.role });
  };

  if (user?.role !== 'admin') {
    return <Layout><div>Access denied</div></Layout>;
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Add User
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddUser} className="mb-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Add New User</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              className="w-full mb-2 px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full mb-4 px-3 py-2 border rounded"
              required
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Add User
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="ml-2 px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {users.map((u) => (
              <div key={u.id} className="p-4 border-b flex justify-between items-center">
                {editingUser === u.id ? (
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      className="w-full mb-2 px-3 py-2 border rounded"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full mb-2 px-3 py-2 border rounded"
                      placeholder="Email"
                    />
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'agent' })}
                      className="w-full mb-2 px-3 py-2 border rounded"
                    >
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="flex">
                      <button
                        onClick={() => handleEditUser(u.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-600 text-white px-3 py-1 rounded mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="font-semibold">{u.fullName}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <span className={`px-2 py-1 rounded text-sm ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </span>
                  </div>
                )}
                {editingUser !== u.id && (
                  <button
                    onClick={() => startEditing(u)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
