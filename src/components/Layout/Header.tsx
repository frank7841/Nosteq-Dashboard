import React from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  selectedConversation?: any;
}

export const Header: React.FC<HeaderProps> = ({ selectedConversation }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {selectedConversation ? (
            <div>
              <h2 className="text-xl font-semibold">
                {selectedConversation.customer.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedConversation.customer.phoneNumber}
              </p>
            </div>
          ) : (
            <h2 className="text-xl font-semibold">Conversations</h2>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
};