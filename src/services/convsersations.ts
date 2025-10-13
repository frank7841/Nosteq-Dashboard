import { api } from './api';
import { Conversation, Message } from '../types';

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
};