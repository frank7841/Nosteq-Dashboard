import React, { useState } from 'react';
import type { Conversation, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useUnreadMessagesContext } from '../../context/UnreadMessagesContext';
import { messagesService, conversationsService } from '../../services/convsersations';
import UnreadMessageBadge from '../UnreadMessageBadge';
import { CheckCircle } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  users: User[];
  onAssign: (userId: number) => void;
  messageCount?: number;
  onMarkAsRead?: (conversationId: number) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
  onMarkAsRead,
}) => {
  const { getConversationUnreadCount, refreshUnreadData } = useUnreadMessagesContext();
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const unreadCount = getConversationUnreadCount(conversation.id);
  const isUnread = unreadCount > 0;

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection
    
    if (isMarkingAsRead || unreadCount === 0) return;
    
    setIsMarkingAsRead(true);
    try {
      // Mark all messages in conversation as read
      await messagesService.markConversationAsRead(conversation.id);
      
      // Update conversation status based on unread messages
      await conversationsService.updateStatusBasedOnUnreadMessages(conversation.id);
      
      // Refresh unread data to update UI
      await refreshUnreadData();
      
      // Call parent callback if provided
      onMarkAsRead?.(conversation.id);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        isSelected 
          ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-600 dark:border-l-green-400' 
          : isUnread 
          ? 'bg-blue-50 dark:bg-blue-900/20' 
          : 'bg-white dark:bg-gray-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 transition-colors">
              {conversation.customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold truncate transition-colors ${
                  isUnread 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {conversation.customer.name}
                </h3>
                <UnreadMessageBadge count={unreadCount} size="small" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate transition-colors">
                {conversation.customer.phoneNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
          </span>
          
          {/* Mark as Read Button - only show if there are unread messages */}
          {isUnread && (
            <button
              onClick={handleMarkAsRead}
              disabled={isMarkingAsRead}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              title="Mark conversation as read"
            >
              {isMarkingAsRead ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle size={12} />
              )}
              {isMarkingAsRead ? 'Marking...' : 'Mark Read'}
            </button>
          )}
          
          <span
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              conversation.status === 'open'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : conversation.status === 'pending'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </div>
    </div>
  );
};