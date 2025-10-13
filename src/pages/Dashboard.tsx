import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { ConversationList } from '../components/Conversations/ConversationList';
import { MessageList } from '../components/Messages/MessageList';
import { MessageInput } from '../components/Messages/MessageInput';
import { conversationsService, messagesService } from '../services/convsersations';
import { socketService } from '../services/socket';
import { authService } from '../services/auth';
import type { Conversation, Message, User } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Load conversations and users
  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);

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
    
    if (socket) {
      socketService.onNewMessage((message: Message) => {
        // Add message to current conversation if it matches
        if (selectedConversation && message.conversationId === selectedConversation.id) {
          setMessages((prev) => [...prev, message]);
        }
        
        // Update conversation list
        loadConversations();
      });

      socketService.onNewConversation((conversation: Conversation) => {
        setConversations((prev) => [conversation, ...prev]);
      });

      socketService.onConversationUpdate((update) => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === update.conversationId ? { ...conv, ...update } : conv
          )
        );
      });
    }

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationsService.getAll();
      setConversations(data);
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

      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
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
            <h2 className="text-lg font-semibold">Conversations</h2>
            <p className="text-sm text-gray-500">{conversations.length} total</p>
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