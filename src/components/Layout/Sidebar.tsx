import React from 'react';
import { MessageSquare, Users, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.(); // Close sidebar on mobile after logout
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.(); // Close sidebar on mobile after navigation
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-6 lg:w-8 h-6 lg:h-8 text-green-500 mr-2 lg:mr-3" />
            <h1 className="text-lg lg:text-xl font-bold">WhatsApp CRM</h1>
          </div>
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 lg:p-4">
        <button
          onClick={() => handleNavigation('/')}
          className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 bg-green-600 rounded-lg mb-2 hover:bg-green-700 transition touch-manipulation"
        >
          <MessageSquare className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
          <span className="text-sm lg:text-base">Conversations</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => handleNavigation('/users')}
            className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg mb-2 hover:bg-gray-800 transition touch-manipulation"
          >
            <Users className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
            <span className="text-sm lg:text-base">Users</span>
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => handleNavigation('/customers')}
            className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg mb-2 hover:bg-gray-800 transition touch-manipulation"
          >
            <Users className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
            <span className="text-sm lg:text-base">Customers</span>
          </button>
        )}

        <button
          onClick={() => handleNavigation('/settings')}
          className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-gray-800 transition touch-manipulation"
        >
          <Settings className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
          <span className="text-sm lg:text-base">Settings</span>
        </button>
      </nav>

      <div className="p-3 lg:p-4 border-t border-gray-700">
        <div className="mb-3 lg:mb-4">
          <p className="text-xs lg:text-sm text-gray-400">Logged in as</p>
          <p className="font-semibold text-sm lg:text-base truncate">{user?.fullName}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 lg:px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition touch-manipulation"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm lg:text-base">Logout</span>
        </button>
      </div>
    </div>
  );
};