import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { ConversationList } from '../components/Conversations/ConversationList';
import { MessageList } from '../components/Messages/MessageList';
import { MessageInput } from '../components/Messages/MessageInput';
import { conversationsService, messagesService } from '../services/convsersations';
import { socketService } from '../services/socket';
import { authService } from '../services/auth';
import { ArrowLeft } from 'lucide-react';
import { markConversationAsRead, getTotalUnreadCount } from '../utils/readStatus';
import type { Conversation, Message, User } from '../types';

export const Dashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [viewFilter, setViewFilter] = useState<'all' | 'mine'>('all');
  const [showConversationList, setShowConversationList] = useState(true);
  const [conversationMessageCounts, setConversationMessageCounts] = useState<{ [conversationId: number]: number }>({});

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
        setMessages((prev) => {
          const newMessages = prev.some((m) => m.id === message.id) ? prev : [...prev, message];
          // Update message count and mark as read since user is actively viewing
          setConversationMessageCounts(prevCounts => ({
            ...prevCounts,
            [message.conversationId]: newMessages.length
          }));
          markConversationAsRead(message.conversationId, newMessages.length);
          return newMessages;
        });
      } else {
        // Update message count for conversations not currently being viewed
        setConversationMessageCounts(prevCounts => ({
          ...prevCounts,
          [message.conversationId]: (prevCounts[message.conversationId] || 0) + 1
        }));
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
      
      // Update message count for this conversation
      setConversationMessageCounts(prev => ({
        ...prev,
        [conversationId]: data.length
      }));
      
      return data;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      // Leave previous conversation room
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation.id);
      }

      setSelectedConversation(conversation);
      const messages = await loadMessages(conversation.id);
      
      // Mark conversation as read with current message count
      markConversationAsRead(conversation.id, messages?.length || 0);
      
      // Join new conversation room
      socketService.joinConversation(conversation.id);
      
      // Hide conversation list on mobile after selection
      setShowConversationList(false);
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleBackToConversations = () => {
    setShowConversationList(true);
    // Optionally clear selection on mobile
    // setSelectedConversation(null);
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
  <div className="flex h-full relative">
    {/* Mobile/Tablet Conversations List Overlay */}
    <div className={`${
      showConversationList ? 'block' : 'hidden'
    } md:block absolute md:relative z-10 md:z-auto w-full md:w-80 lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full`}>
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversations</h2>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              {conversations.length} {viewFilter === 'mine' ? 'assigned to me' : 'total'}
            </p>
            {(() => {
              const totalUnread = getTotalUnreadCount(
                conversations.map(c => ({ id: c.id, messageCount: conversationMessageCounts[c.id] || 0 }))
              );
              return totalUnread > 0 ? (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {totalUnread} unread
                </span>
              ) : null;
            })()}
          </div>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-2 md:px-3 py-1 text-xs md:text-sm border ${
                viewFilter === 'all' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              } rounded-l transition-colors`}
            >
              All
            </button>
            <button
              onClick={() => setViewFilter('mine')}
              className={`px-2 md:px-3 py-1 text-xs md:text-sm border ${
                viewFilter === 'mine' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              } rounded-r transition-colors`}
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
          conversationMessageCounts={conversationMessageCounts}
      />
    </div>

    {/* Messages Area */}
    <div className={`${
      showConversationList ? 'hidden' : 'flex'
    } md:flex flex-1 flex-col w-full`}>
      {selectedConversation ? (
        <>
          {/* Mobile Header with Back Button */}
          <div className="md:hidden flex items-center p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBackToConversations}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {selectedConversation.customer.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedConversation.customer.phoneNumber}
              </p>
            </div>
          </div>
          
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
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
          <div className="text-center px-4">
            <div className="text-4xl md:text-6xl mb-4">💬</div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select a conversation
            </h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
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