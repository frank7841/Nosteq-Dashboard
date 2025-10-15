import React from 'react';
import type { Conversation, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { isConversationUnread, getUnreadCount } from '../../utils/readStatus';

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
  messageCount = 0,
}) => {
  const isUnread = isConversationUnread(conversation.id, messageCount);
  const unreadCount = getUnreadCount(conversation.id, messageCount);
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
                {isUnread && unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conversation.customer.phoneNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
          </span>
          <span
            className={`mt-1 px-2 py-1 text-xs rounded-full ${
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