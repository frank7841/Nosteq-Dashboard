import React from 'react';
import type { Message } from '../../types';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOutbound
            ? 'bg-green-500 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 text-xs ${
          isOutbound ? 'text-green-100' : 'text-gray-500'
        }`}>
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {isOutbound && (
            <span className="ml-1">
              {message.status === 'read' ? (
                <CheckCheck className="w-3 h-3 text-blue-300" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};