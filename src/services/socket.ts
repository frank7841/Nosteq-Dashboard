import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL;

let socket: Socket | null = null;

export const socketService = {
  connect: (token: string) => {
    if (!socket) {
      socket = io(WS_URL, {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    }
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  joinConversation: (conversationId: number) => {
    if (socket) {
      socket.emit('join_conversation', { conversationId });
    }
  },

  leaveConversation: (conversationId: number) => {
    if (socket) {
      socket.emit('leave_conversation', { conversationId });
    }
  },

  onNewMessage: (callback: (message: any) => void) => {
    if (socket) {
      socket.on('new_message', callback);
    }
  },

  onNewConversation: (callback: (conversation: any) => void) => {
    if (socket) {
      socket.on('new_conversation', callback);
    }
  },

  onConversationUpdate: (callback: (update: any) => void) => {
    if (socket) {
      socket.on('conversation_update', callback);
    }
  },

  getSocket: () => socket,
};