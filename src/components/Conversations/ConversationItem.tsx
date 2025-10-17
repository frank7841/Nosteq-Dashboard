import React from 'react';
import type { Conversation, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useUnreadMessagesContext } from '../../context/UnreadMessagesContext';
import UnreadMessageBadge from '../UnreadMessageBadge';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  users: User[];
  onAssign: (userId: number) => void;
  messageCount?: number;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const { getConversationUnreadCount } = useUnreadMessagesContext();
  const unreadCount = getConversationUnreadCount(conversation.id);
  const isUnread = unreadCount > 0;



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