import { useState, useEffect, useCallback } from 'react';
import { messagesService } from '../services/convsersations';
import type { Message } from '../types';

interface UnreadMessagesHook {
  totalUnreadCount: number;
  unreadMessages: Message[];
  getConversationUnreadCount: (conversationId: number) => number;
  getConversationUnreadMessages: (conversationId: number) => Message[];
  refreshUnreadData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useUnreadMessages = (isAuthenticated: boolean = false): UnreadMessagesHook => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUnreadData = useCallback(async () => {
    if (!isAuthenticated) {
      setTotalUnreadCount(0);
      setUnreadMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [countResponse, messagesResponse] = await Promise.all([
        messagesService.getUnreadCount(),
        messagesService.getUnreadMessages()
      ]);

      setTotalUnreadCount(countResponse.count);
      setUnreadMessages(messagesResponse);
    } catch (err) {
      setError('Failed to fetch unread messages');
      console.error('Error fetching unread messages:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getConversationUnreadCount = useCallback((conversationId: number): number => {
    return unreadMessages.filter(message => 
      message.conversationId === conversationId && 
      message.direction === 'inbound' && 
      (message.status !== 'read' || message.readAt === null)
    ).length;
  }, [unreadMessages]);

  const getConversationUnreadMessages = useCallback((conversationId: number): Message[] => {
    return unreadMessages.filter(message => 
      message.conversationId === conversationId && 
      message.direction === 'inbound' && 
      (message.status !== 'read' || message.readAt === null)
    );
  }, [unreadMessages]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadData();
      
      // Set up polling to ensure we never miss unread messages
      const interval = setInterval(refreshUnreadData, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    } else {
      // Reset state when not authenticated
      setTotalUnreadCount(0);
      setUnreadMessages([]);
      setLoading(false);
      setError(null);
    }
  }, [refreshUnreadData, isAuthenticated]);

  return {
    totalUnreadCount,
    unreadMessages,
    getConversationUnreadCount,
    getConversationUnreadMessages,
    refreshUnreadData,
    loading,
    error
  };
};
