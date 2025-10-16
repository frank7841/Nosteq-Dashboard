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
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition ${
        isSelected ? 'bg-green-50 border-l-4 border-l-green-600' : isUnread ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
              {conversation.customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold truncate ${
                  isUnread ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {conversation.customer.name}
                </h3>
                <UnreadMessageBadge count={unreadCount} size="small" />
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conversation.customer.phoneNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
          </span>
          
          {/* Mark as Read Button - only show if there are unread messages */}
          {isUnread && (
            <button
              onClick={handleMarkAsRead}
              disabled={isMarkingAsRead}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
            className={`px-2 py-1 text-xs rounded-full ${
              conversation.status === 'open'
                ? 'bg-green-100 text-green-800'
                : conversation.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </div>
    </div>
  );
};