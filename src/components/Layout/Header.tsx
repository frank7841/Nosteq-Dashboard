import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  selectedConversation?: any;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ selectedConversation, onMenuClick, showMenuButton }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          {showMenuButton && onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 mr-2 hover:bg-gray-100 rounded-full touch-manipulation"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div>
            {selectedConversation ? (
              <div>
                <h2 className="text-lg md:text-xl font-semibold truncate max-w-[200px] md:max-w-none">
                  {selectedConversation.customer.name}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 truncate max-w-[200px] md:max-w-none">
                  {selectedConversation.customer.phoneNumber}
                </p>
              </div>
            ) : (
              <h2 className="text-lg md:text-xl font-semibold">Conversations</h2>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full touch-manipulation">
            <Search className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full relative touch-manipulation">
            <Bell className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
};