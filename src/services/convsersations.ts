import { api } from './api';
import type { Conversation, Message } from '../types';

export const conversationsService = {
  getAll: async (status?: string): Promise<Conversation[]> => {
    const params = status ? { status } : {};
    const response = await api.get<Conversation[]>('/conversations', { params });
    return response.data;
  },

  getMyConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/conversations/my-conversations');
    return response.data;
  },

  getOne: async (id: number): Promise<Conversation> => {
    const response = await api.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  assignToUser: async (id: number, userId: number): Promise<Conversation> => {
    const response = await api.patch<Conversation>(`/conversations/${id}/assign`, { userId });
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<Conversation> => {
    const response = await api.patch<Conversation>(`/conversations/${id}/status`, { status });
    return response.data;
  },

  updateStatusBasedOnUnreadMessages: async (conversationId: number): Promise<Conversation> => {
    // Get unread count for this conversation
    const unreadResponse = await messagesService.getUnreadCount(conversationId);
    const newStatus = unreadResponse.count > 0 ? 'open' : 'closed';
    
    // Update the conversation status
    const response = await api.patch<Conversation>(`/conversations/${conversationId}/status`, { status: newStatus });
    return response.data;
  },
};

export const messagesService = {
  getByConversation: async (conversationId: number): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/messages/conversation/${conversationId}`);
    return response.data;
  },

  sendMessage: async (data: {
    conversationId: number;
    customerId: number;
    content: string;
    phoneNumber: string;
  }): Promise<Message> => {
    const response = await api.post<Message>('/messages/send', data);
    return response.data;
  },

  markAsRead: async (messageId: number): Promise<Message> => {
    const response = await api.post<Message>(`/messages/${messageId}/read`);
    return response.data;
  },

  markConversationAsRead: async (conversationId: number): Promise<Message[]> => {
    const response = await api.post<Message[]>(`/messages/conversation/${conversationId}/read`);
    return response.data;
  },

  // Unread message endpoints
  getUnreadCount: async (conversationId?: number): Promise<{ count: number }> => {
    const params = conversationId ? { conversationId } : {};
    const response = await api.get<{ count: number }>('/messages/unread/count', { params });
    return response.data;
  },

  getUnreadMessages: async (conversationId?: number): Promise<Message[]> => {
    const params = conversationId ? { conversationId } : {};
    const response = await api.get<Message[]>('/messages/unread', { params });
    return response.data;
  },
};