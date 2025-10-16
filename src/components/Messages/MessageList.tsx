import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types';

import { format } from 'date-fns';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 transition-colors overscroll-contain"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {messages.map((message, index) => {
        const showDate =
          index === 0 ||
          format(new Date(messages[index - 1].createdAt), 'yyyy-MM-dd') !==
            format(new Date(message.createdAt), 'yyyy-MM-dd');

        return (
          <React.Fragment key={message.id}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full transition-colors">
                  {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                </span>
              </div>
            )}
            <MessageBubble message={message} />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
};