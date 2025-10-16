import React from 'react';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import UnreadMessageBadge from './UnreadMessageBadge';
import type { Message } from '../types';

interface UnreadMessagesListProps {
  conversationId?: number;
  onMessageClick?: (message: Message) => void;
  maxDisplay?: number;
  className?: string;
}

const UnreadMessagesList: React.FC<UnreadMessagesListProps> = ({
  conversationId,
  onMessageClick,
  maxDisplay = 5,
  className = ''
}) => {
  const { 
    unreadMessages, 
    getConversationUnreadMessages, 
    getConversationUnreadCount,
    totalUnreadCount,
    loading, 
    error 
  } = useUnreadMessages();

  const displayMessages = conversationId 
    ? getConversationUnreadMessages(conversationId)
    : unreadMessages;

  const displayCount = conversationId 
    ? getConversationUnreadCount(conversationId)
    : totalUnreadCount;

  const messagesToShow = displayMessages.slice(0, maxDisplay);
  const hasMore = displayMessages.length > maxDisplay;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Loading unread messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-600 text-sm">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (displayMessages.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500 text-sm text-center">
          🎉 No unread messages!
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          Unread Messages
          <UnreadMessageBadge count={displayCount} size="small" />
        </h3>
        {conversationId && (
          <span className="text-xs text-gray-500">
            Conversation #{conversationId}
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {messagesToShow.map((message) => (
          <div
            key={message.id}
            onClick={() => onMessageClick?.(message)}
            className={`
              p-3 border-b border-gray-100 hover:bg-blue-50 
              ${onMessageClick ? 'cursor-pointer' : ''}
              transition-colors
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {message.customer?.name || 'Unknown Customer'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.customer?.phoneNumber}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-words">
                  {truncateContent(message.content)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatTime(message.createdAt)}
                  </span>
                  <span className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${message.messageType === 'text' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                    }
                  `}>
                    {message.messageType}
                  </span>
                </div>
              </div>
              <UnreadMessageBadge count={1} size="small" />
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="p-3 text-center bg-gray-50">
            <span className="text-sm text-gray-600">
              +{displayMessages.length - maxDisplay} more unread messages
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnreadMessagesList;
