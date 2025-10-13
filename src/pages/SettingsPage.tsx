import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Layout/Sidebar';
import { ShieldCheck, MessageSquare, UserCircle2, Loader2 } from 'lucide-react';
import { usersService } from '../services/users';
import { conversationsService } from '../services/convsersations';
import type { User, Conversation } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State for assignment UI
  const [agents, setAgents] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | ''>('');
  const [selectedAgentId, setSelectedAgentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [allUsers, allConvos] = await Promise.all([
          usersService.getAll(),
          conversationsService.getAll(),
        ]);
        setAgents(allUsers.filter((u) => u.role === 'agent'));
        setConversations(allConvos);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          {/* Admin Activities Section */}
          {user?.role === 'admin' ? (
            <section className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                <ShieldCheck className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold">Admin Activities</h2>
              </div>

              <div className="border rounded-lg divide-y">
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium">Assign Conversation</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Select a conversation and assign it to an agent.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Conversation</label>
                          <select
                            value={selectedConversationId}
                            onChange={(e) => setSelectedConversationId(e.target.value ? Number(e.target.value) : '')}
                            className="w-full border rounded px-3 py-2"
                            disabled={loading || submitting}
                          >
                            <option value="">Select conversation…</option>
                            {conversations.map((c) => (
                              <option key={c.id} value={c.id}>
                                #{c.id} · {c.customer?.name || c.customer?.phoneNumber}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Agent</label>
                          <div className="relative">
                            <select
                              value={selectedAgentId}
                              onChange={(e) => setSelectedAgentId(e.target.value ? Number(e.target.value) : '')}
                              className="w-full border rounded px-3 py-2"
                              disabled={loading || submitting}
                            >
                              <option value="">Select agent…</option>
                              {agents.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.fullName} ({a.email})
                                </option>
                              ))}
                            </select>
                            <UserCircle2 className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={async () => {
                              setError(null);
                              setSuccess(null);
                              if (!selectedConversationId || !selectedAgentId) {
                                setError('Please select both conversation and agent');
                                return;
                              }
                              try {
                                setSubmitting(true);
                                await conversationsService.assignToUser(selectedConversationId, selectedAgentId);
                                setSuccess('Conversation assigned successfully');
                              } catch (e: any) {
                                setError(e?.response?.data?.message || e?.message || 'Failed to assign conversation');
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                            disabled={loading || submitting}
                            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {submitting ? (
                              <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Assigning…</span>
                            ) : (
                              'Assign'
                            )}
                          </button>
                        </div>
                      </div>
                      {(error || success) && (
                        <div className="mt-3">
                          {error && <p className="text-sm text-red-600">{error}</p>}
                          {success && <p className="text-sm text-green-700">{success}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded inline-flex items-center">
                    {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                    {loading ? 'Loading…' : 'Ready'}
                  </span>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">Admin Activities</h2>
              <p className="text-sm text-gray-600">You do not have permission to view admin activities.</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
