import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { ConversationList } from '../components/Conversations/ConversationList';
import { MessageList } from '../components/Messages/MessageList';
import { MessageInput } from '../components/Messages/MessageInput';
import { conversationsService, messagesService } from '../services/convsersations';
import { socketService } from '../services/socket';
import { authService } from '../services/auth';
import type { Conversation, Message, User } from '../types';

export const Dashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [viewFilter, setViewFilter] = useState<'all' | 'mine'>('all');

  // Load conversations and users
  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);

  // Reload conversations when filter changes
  useEffect(() => {
    // If changing filter, clear any current selection/messages to avoid stale display
    if (selectedConversation) {
      socketService.leaveConversation(selectedConversation.id);
    }
    setSelectedConversation(null);
    setMessages([]);
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewFilter]);

  const loadUsers = async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  // Set up WebSocket listeners
  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // If viewing this conversation, append without duplicates
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }
      // Refresh the conversations list (e.g., lastMessageAt)
      loadConversations();
    };

    const handleNewConversation = (conversation: Conversation) => {
      setConversations((prev) => [conversation, ...prev]);
    };

    const handleConversationUpdate = (update: Partial<Conversation> & { conversationId: number }) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === update.conversationId ? { ...conv, ...update } : conv))
      );
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onNewConversation(handleNewConversation);
    socketService.onConversationUpdate(handleConversationUpdate);

    return () => {
      // Remove listeners to avoid duplicates after re-renders
      socketService.offNewMessage(handleNewMessage);
      socketService.offNewConversation(handleNewConversation);
      socketService.offConversationUpdate(handleConversationUpdate);

      // Leave room for previously selected conversation
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data =
        viewFilter === 'mine'
          ? await conversationsService.getMyConversations()
          : await conversationsService.getAll();
      setConversations(data);
      // If current selection is not in the new list, clear selection/messages
      if (selectedConversation && !data.some((c) => c.id === selectedConversation.id)) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const data = await messagesService.getByConversation(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    // Leave previous conversation
    if (selectedConversation) {
      socketService.leaveConversation(selectedConversation.id);
    }

    setSelectedConversation(conversation);

    // Join new conversation
    socketService.joinConversation(conversation.id);

    // Load messages
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      setSendingMessage(true);
      const newMessage = await messagesService.sendMessage({
        conversationId: selectedConversation.id,
        customerId: selectedConversation.customerId,
        content,
        phoneNumber: selectedConversation.customer.phoneNumber,
      });

      // De-duplicate optimistic append (in case server echo comes via socket)
      setMessages((prev) => (prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]));
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMediaSent = (mediaMessage: any) => {
    // Add the media message to the message list immediately
    console.log('Media message received:', mediaMessage);
    
    // If the response contains a message object, add it to the messages
    if (mediaMessage && mediaMessage.id) {
      setMessages((prev) => {
        // De-duplicate in case the message already exists
        const exists = prev.some((m) => m.id === mediaMessage.id);
        return exists ? prev : [...prev, mediaMessage];
      });
    } else {
      // If no message object returned, refresh the entire message list
      if (selectedConversation) {
        loadMessages(selectedConversation.id);
      }
    }
  };

  const handleAssignConversation = async (conversationId: number, userId: number) => {
    try {
      await conversationsService.assignToUser(conversationId, userId);
      loadConversations();
    } catch (error) {
      console.error('Failed to assign conversation:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Loading conversations...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout selectedConversation={selectedConversation}>
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {conversations.length} {viewFilter === 'mine' ? 'assigned to me' : 'total'}
              </p>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={() => setViewFilter('all')}
                  className={`px-3 py-1 text-sm border ${
                    viewFilter === 'all' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'
                  } rounded-l`}
                >
                  All
                </button>
                <button
                  onClick={() => setViewFilter('mine')}
                  className={`px-3 py-1 text-sm border ${
                    viewFilter === 'mine' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'
                  } rounded-r`}
                >
                  My
                </button>
              </div>
            </div>
          </div>
          <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              users={users}
              onAssignConversation={handleAssignConversation}
          />
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <MessageList messages={messages} />
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={sendingMessage}
                conversationId={selectedConversation.id}
                customerId={selectedConversation.customerId}
                phoneNumber={selectedConversation.customer.phoneNumber}
                onMediaSent={handleMediaSent}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};