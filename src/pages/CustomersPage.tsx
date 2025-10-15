import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { customersService, type CreateCustomerDto } from '../services/customers';
import { useAuth } from '../context/AuthContext';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Array<{ id: number; name: string; phoneNumber: string; email?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CreateCustomerDto>({ name: '', phoneNumber: '', email: '' });

  // Edit/Delete state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; phoneNumber: string; email?: string }>({ name: '', phoneNumber: '', email: '' });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);
    try {
      const created = await customersService.create({
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email?.trim() || undefined,
      });
      setCustomers((prev) => [created, ...prev]);
      setForm({ name: '', phoneNumber: '', email: '' });
      setSuccess('Customer created successfully');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create customer');
    } finally {
      setCreating(false);
    }
  };

  // Edit handlers (PATCH)
  const startEdit = (c: { id: number; name: string; phoneNumber: string; email?: string }) => {
    setEditingId(c.id);
    setEditForm({ name: c.name, phoneNumber: c.phoneNumber, email: c.email });
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', phoneNumber: '', email: '' });
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
        email: editForm.email?.trim() || undefined,
      });
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSuccess('Customer updated');
      cancelEdit();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await customersService.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSuccess('Customer deleted');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-100" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Customers</h1>
          {!isAdmin && (
            <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded">
              You do not have permission to create customers.
            </div>
          )}
          <section className="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Create New Customer</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-2 md:px-3 py-1.5 md:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  placeholder="Name"
                  disabled={!isAdmin || creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-2 md:px-3 py-1.5 md:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  placeholder="Phone Number"
                  disabled={!isAdmin || creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-2 md:px-3 py-1.5 md:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  placeholder="Email (optional)"
                  disabled={!isAdmin || creating}
                />
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!isAdmin || creating}
                  className="bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm md:text-base"
                >
                  {creating ? 'Creating...' : 'Create Customer'}
                </button>
                {(error || success) && (
                  <div className="mt-3 md:mt-4">
                    {error && <p className="text-xs md:text-sm text-red-600">{error}</p>}
                    {success && <p className="text-xs md:text-sm text-green-700">{success}</p>}
                  </div>
                )}
              </div>
            </form>
          </section>
          {/* Customers List Section */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-semibold">All Customers ({customers.length})</h2>
            </div>
            {loading ? (
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base text-gray-600">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-4 md:p-6 text-center">
                <p className="text-sm md:text-base text-gray-600">No customers found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                {customers.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                      {editingId === c.id ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 md:px-3 py-1.5 md:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                            placeholder="Name"
                            disabled={!isAdmin || saving}
                          />
                          <input
                            name="phoneNumber"
                            value={editForm.phoneNumber}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 md:px-3 py-1.5 md:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                            placeholder="Phone Number"
                            disabled={!isAdmin || saving}
                          />
                          <input
                            type="email"
                            name="email"
                            value={editForm.email || ''}
                            onChange={handleEditChange}
                            className="w-full border rounded px-2 md:px-3 py-1.5 md:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                            placeholder="Email (optional)"
                            disabled={!isAdmin || saving}
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-sm text-gray-600">{c.phoneNumber}{c.email ? ` · ${c.email}` : ''}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          editingId === c.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {saving ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(c)}
                                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                disabled={deletingId === c.id}
                                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                {deletingId === c.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};
