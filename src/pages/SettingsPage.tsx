import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Layout/Sidebar';
import { ShieldCheck, MessageSquare } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

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
                      <p className="text-sm text-gray-600">
                        Admins can assign conversations to agents from the Conversations page.
                        This action is audited as an admin activity.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Visible</span>
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
