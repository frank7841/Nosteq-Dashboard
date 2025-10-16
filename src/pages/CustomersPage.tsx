import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/Layout/Layout';
import { customersService } from '../services/customers';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, Save, X, User, Phone, Mail } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Array<{ id: number; name: string; phoneNumber: string; email?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit/Delete state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; phoneNumber: string }>({ name: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await customersService.getAll();
        setCustomers(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);



  // Edit handlers (PATCH)
  const startEdit = (c: { id: number; name: string; phoneNumber: string }) => {
    setEditingId(c.id);
    setEditForm({ name: c.name, phoneNumber: c.phoneNumber });
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', phoneNumber: '' });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await customersService.update(editingId, {
        name: editForm.name?.trim() || undefined,
        phoneNumber: editForm.phoneNumber?.trim() || undefined,
      });
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSuccess('Customer updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      cancelEdit();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await customersService.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSuccess('Customer deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.phoneNumber.includes(term) ||
      (customer.email && customer.email.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50 dark:bg-gray-900" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your customer database ({filteredCustomers.length} {searchTerm ? 'filtered' : 'total'})
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm text-sm font-medium touch-manipulation"
              >
                <Plus size={16} />
                Add Customer
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-4 md:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search customers by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Success/Error Messages */}
          {(error || success) && (
            <div className="mb-4 md:mb-6">
              {error && (
                <div className="p-3 md:p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-xs md:text-sm">{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300">
                    <X size={14} />
                  </button>
                </div>
              )}
              {success && (
                <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                  <Save size={16} className="text-green-500" />
                  <span className="text-xs md:text-sm">{success}</span>
                  <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700 dark:hover:text-green-300">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {!isAdmin && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
              <User size={16} className="text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs md:text-sm">You have read-only access to customer data.</p>
            </div>
          )}

          {/* Customers List Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <User size={18} className="text-gray-600 dark:text-gray-400" />
                  Customer Directory
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                  {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
                </span>
              </div>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-green-600 dark:border-t-green-500 rounded-full animate-spin"></div>
                  <span className="text-sm">Loading customers...</span>
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <User size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {searchTerm ? 'No customers match your search' : 'No customers found'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
                {!searchTerm && isAdmin && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 text-sm font-medium"
                  >
                    Add your first customer
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                {filteredCustomers.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {editingId === c.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              <User size={12} />
                              Name
                            </label>
                            <input
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Customer name"
                              disabled={saving}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              <Phone size={12} />
                              Phone
                            </label>
                            <input
                              name="phoneNumber"
                              value={editForm.phoneNumber}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Phone number"
                              disabled={saving}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium touch-manipulation"
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
                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base truncate">
                              {c.name}
                            </h3>
                            <div className="space-y-1 mt-1">
                              <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                <Phone size={12} className="text-gray-400 dark:text-gray-500" />
                                <span className="font-mono">{c.phoneNumber}</span>
                              </div>
                              {c.email && (
                                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                  <Mail size={12} className="text-gray-400 dark:text-gray-500" />
                                  <span className="truncate">{c.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1 ml-4">
                            <button
                              onClick={() => startEdit(c)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors touch-manipulation"
                              title="Edit customer"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={deletingId === c.id}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                              title="Delete customer"
                            >
                              {deletingId === c.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        )}
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
