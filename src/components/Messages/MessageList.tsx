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
      <div className="flex items-center justify-center h-full text-gray-500 px-4">
        <p className="text-center text-sm md:text-base">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      {messages.map((message, index) => {
        const showDate =
          index === 0 ||
          format(new Date(messages[index - 1].createdAt), 'yyyy-MM-dd') !==
            format(new Date(message.createdAt), 'yyyy-MM-dd');

        return (
          <React.Fragment key={message.id}>
            {showDate && (
              <div className="flex justify-center my-3 md:my-4">
                <span className="bg-white px-3 md:px-4 py-1 rounded-full text-xs text-gray-600 border border-gray-200">
                  {format(new Date(message.createdAt), 'MMMM dd, yyyy')}
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