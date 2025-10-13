import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  selectedConversation?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, selectedConversation }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedConversation={selectedConversation} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};