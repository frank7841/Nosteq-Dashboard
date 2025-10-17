import React from 'react';
import type { Conversation, User } from '../../types';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelectConversation: (conversation: Conversation) => void;
  users: User[];
  onAssignConversation: (conversationId: number, assigneeId: number) => void;
  conversationMessageCounts?: { [conversationId: number]: number };
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  users,
  onAssignConversation,
  conversationMessageCounts = {},
}) => {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 transition-colors">
        <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full bg-gray-50 dark:bg-gray-800 transition-colors">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onClick={() => onSelectConversation(conversation)}
          users={users}
          onAssign={(userId) => onAssignConversation(conversation.id, userId)}
          messageCount={conversationMessageCounts[conversation.id] || 0}
        />
      ))}
    </div>
  );
};