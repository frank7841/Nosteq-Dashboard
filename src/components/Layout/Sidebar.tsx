import React from 'react';
import { MessageSquare, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center">
          <MessageSquare className="w-8 h-8 text-green-500 mr-3" />
          <h1 className="text-xl font-bold">WhatsApp CRM</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center px-4 py-3 bg-green-600 rounded-lg mb-2 hover:bg-green-700 transition"
        >
          <MessageSquare className="w-5 h-5 mr-3" />
          <span>Conversations</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/users')}
            className="w-full flex items-center px-4 py-3 rounded-lg mb-2 hover:bg-gray-800 transition"
          >
            <Users className="w-5 h-5 mr-3" />
            <span>Users</span>
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/customers')}
            className="w-full flex items-center px-4 py-3 rounded-lg mb-2 hover:bg-gray-800 transition"
          >
            <Users className="w-5 h-5 mr-3" />
            <span>Customers</span>
          </button>
        )}

        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          <Settings className="w-5 h-5 mr-3" />
          <span>Settings</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="font-semibold">{user?.fullName}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};