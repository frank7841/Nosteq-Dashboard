import React, { useState } from 'react';
import { AlertTriangle, X, Eye } from 'lucide-react';
import { useUnreadMessagesContext } from '../context/UnreadMessagesContext';
import UnreadMessagesList from './UnreadMessagesList';
import type { Message } from '../types';

interface CriticalUnreadAlertProps {
  onMessageClick?: (message: Message) => void;
}

const CriticalUnreadAlert: React.FC<CriticalUnreadAlertProps> = ({ onMessageClick }) => {
  const { 
    criticalUnreadMessages, 
    hasCriticalUnread, 
    markMessageAsHandled,
    totalUnreadCount 
  } = useUnreadMessagesContext();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!hasCriticalUnread || isDismissed) {
    return null;
  }

  const handleMarkAllAsHandled = () => {
    criticalUnreadMessages.forEach(message => {
      markMessageAsHandled(message.id);
    });
    setIsDismissed(true);
  };

  const handleMessageClick = (message: Message) => {
    markMessageAsHandled(message.id);
    onMessageClick?.(message);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg overflow-hidden">
        {/* Alert Header */}
        <div className="flex items-center justify-between p-4 bg-red-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">
              {totalUnreadCount} Unread Message{totalUnreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-red-200 rounded transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Eye className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={handleMarkAllAsHandled}
              className="p-1 hover:bg-red-200 rounded transition-colors"
              title="Mark all as handled"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Alert Content */}
        <div className="p-4">
          <p className="text-red-700 text-sm mb-3">
            🚨 <strong>Critical:</strong> You have unread messages that require attention!
          </p>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              {isExpanded ? 'Hide' : 'View'} Messages
            </button>
            <button
              onClick={handleMarkAllAsHandled}
              className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Expanded Message List */}
          {isExpanded && (
            <div className="border-t border-red-200 pt-3">
              <UnreadMessagesList
                onMessageClick={handleMessageClick}
                maxDisplay={3}
                className="bg-white rounded border"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CriticalUnreadAlert;
