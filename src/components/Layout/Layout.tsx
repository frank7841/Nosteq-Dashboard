import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  selectedConversation?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, selectedConversation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          selectedConversation={selectedConversation} 
          onMenuClick={() => setSidebarOpen(true)}
          showMenuButton={true}
        />
        <main className="flex-1 overflow-hidden bg-white dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};