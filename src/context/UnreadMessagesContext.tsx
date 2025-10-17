import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useAuth } from './AuthContext';
import type { Message } from '../types';

interface UnreadMessagesContextType {
  totalUnreadCount: number;
  unreadMessages: Message[];
  getConversationUnreadCount: (conversationId: number) => number;
  getConversationUnreadMessages: (conversationId: number) => Message[];
  refreshUnreadData: () => Promise<void>;
  loading: boolean;
  error: string | null;
  // Critical unread tracking
  criticalUnreadMessages: Message[];
  hasCriticalUnread: boolean;
  markMessageAsHandled: (messageId: number) => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export const useUnreadMessagesContext = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error('useUnreadMessagesContext must be used within UnreadMessagesProvider');
  }
  return context;
};

interface UnreadMessagesProviderProps {
  children: React.ReactNode;
}

export const UnreadMessagesProvider: React.FC<UnreadMessagesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const unreadHook = useUnreadMessages(isAuthenticated);
  const [handledMessageIds, setHandledMessageIds] = useState<Set<number>>(new Set());

  // Critical unread messages are those that haven't been handled yet
  const criticalUnreadMessages = unreadHook.unreadMessages.filter(
    message => !handledMessageIds.has(message.id)
  );

  const hasCriticalUnread = criticalUnreadMessages.length > 0;

  const markMessageAsHandled = (messageId: number) => {
    setHandledMessageIds(prev => new Set([...prev, messageId]));
  };

  // Clear handled messages when unread messages are refreshed
  useEffect(() => {
    const currentUnreadIds = new Set(unreadHook.unreadMessages.map(m => m.id));
    setHandledMessageIds(prev => {
      const filtered = new Set([...prev].filter(id => currentUnreadIds.has(id)));
      return filtered;
    });
  }, [unreadHook.unreadMessages]);

  // Browser notification for critical unread messages (only when authenticated)
  useEffect(() => {
    if (isAuthenticated && hasCriticalUnread && criticalUnreadMessages.length > 0) {
      // Request notification permission if not granted
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Show notification for new unread messages
      if (Notification.permission === 'granted') {
        const latestMessage = criticalUnreadMessages[criticalUnreadMessages.length - 1];
        new Notification('New Unread Message', {
          body: `${latestMessage.customer?.name || 'Customer'}: ${latestMessage.content.substring(0, 50)}...`,
          icon: '/favicon.ico',
          tag: `unread-${latestMessage.id}` // Prevent duplicate notifications
        });
      }
    }
  }, [isAuthenticated, hasCriticalUnread, criticalUnreadMessages]);

  const contextValue: UnreadMessagesContextType = {
    ...unreadHook,
    criticalUnreadMessages,
    hasCriticalUnread,
    markMessageAsHandled
  };

  return (
    <UnreadMessagesContext.Provider value={contextValue}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};
