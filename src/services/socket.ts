import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL;

let socket: Socket | null = null;

export const socketService = {
  connect: (token: string) => {
    if (!socket) {
      socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        withCredentials: true,
        // If your server is mounted under a custom path, uncomment and set it:
        // path: '/socket.io',
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
      // Ensure no duplicate handlers next time we connect
      socket.removeAllListeners();
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

  // Safe subscription helpers that de-duplicate by removing before adding
  onNewMessage: (callback: (message: any) => void) => {
    if (socket) {
      socket.off('new_message', callback);
      socket.on('new_message', callback);
    }
  },
  offNewMessage: (callback: (message: any) => void) => {
    if (socket) {
      socket.off('new_message', callback);
    }
  },

  onNewConversation: (callback: (conversation: any) => void) => {
    if (socket) {
      socket.off('new_conversation', callback);
      socket.on('new_conversation', callback);
    }
  },
  offNewConversation: (callback: (conversation: any) => void) => {
    if (socket) {
      socket.off('new_conversation', callback);
    }
  },

  onConversationUpdate: (callback: (update: any) => void) => {
    if (socket) {
      socket.off('conversation_update', callback);
      socket.on('conversation_update', callback);
    }
  },
  offConversationUpdate: (callback: (update: any) => void) => {
    if (socket) {
      socket.off('conversation_update', callback);
    }
  },

  getSocket: () => socket,
};