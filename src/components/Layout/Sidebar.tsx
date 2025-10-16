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
    <div className="w-64 bg-gray-900 dark:bg-gray-950 text-white h-screen flex flex-col transition-theme border-r border-gray-700 dark:border-gray-800">
      <div className="p-4 lg:p-6 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-6 lg:w-8 h-6 lg:h-8 text-whatsapp-green-500 dark:text-whatsapp-green-400 mr-2 lg:mr-3" />
            <h1 className="text-lg lg:text-xl font-bold text-white dark:text-gray-100">WhatsApp CRM</h1>
          </div>
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 transition-theme"
            >
              <X className="w-5 h-5 text-gray-300 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 lg:p-4">
        <button
          onClick={() => handleNavigation('/')}
          className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 bg-whatsapp-green-600 dark:bg-whatsapp-green-700 rounded-lg mb-2 hover:bg-whatsapp-green-700 dark:hover:bg-whatsapp-green-600 transition-theme touch-manipulation"
        >
          <MessageSquare className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3 text-white" />
          <span className="text-sm lg:text-base text-white">Conversations</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => handleNavigation('/users')}
            className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg mb-2 hover:bg-gray-800 dark:hover:bg-gray-700 transition-theme touch-manipulation text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
          >
            <Users className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
            <span className="text-sm lg:text-base">Users</span>
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => handleNavigation('/customers')}
            className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg mb-2 hover:bg-gray-800 dark:hover:bg-gray-700 transition-theme touch-manipulation text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
          >
            <Users className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
            <span className="text-sm lg:text-base">Customers</span>
          </button>
        )}

        <button
          onClick={() => handleNavigation('/settings')}
          className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-theme touch-manipulation text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
        >
          <Settings className="w-4 lg:w-5 h-4 lg:h-5 mr-2 lg:mr-3" />
          <span className="text-sm lg:text-base">Settings</span>
        </button>
      </nav>

      <div className="p-3 lg:p-4 border-t border-gray-700 dark:border-gray-800">
        <div className="mb-3 lg:mb-4">
          <p className="text-xs lg:text-sm text-gray-400 dark:text-gray-500">Logged in as</p>
          <p className="font-semibold text-sm lg:text-base truncate text-white dark:text-gray-100">{user?.fullName}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 lg:px-4 py-2 bg-red-600 dark:bg-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-theme touch-manipulation text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm lg:text-base">Logout</span>
        </button>
      </div>
    </div>
  );
};