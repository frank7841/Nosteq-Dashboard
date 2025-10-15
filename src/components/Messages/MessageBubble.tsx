import React from 'react';
import type { Message } from '../../types';
import { format } from 'date-fns';
import { Check, CheckCheck, FileText, Download, Image as ImageIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'outbound';
  const hasMedia = message.mediaUrl && message.mediaUrl.trim() !== '';

  const renderMediaContent = () => {
    if (!hasMedia) return null;

    switch (message.messageType) {
      case 'image':
        return (
          <div className="mb-2">
            <img 
              src={message.mediaUrl} 
              alt={message.content || 'Image'}
              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              style={{ 
                maxHeight: window.innerWidth < 768 ? '200px' : '300px', 
                maxWidth: window.innerWidth < 768 ? '200px' : '250px' 
              }}
              onClick={() => window.open(message.mediaUrl, '_blank')}
              onError={(e) => {
                console.error('Failed to load image:', message.mediaUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );
      
      case 'document':
        const fileName = message.content || 'Document';
        const fileExtension = message.mediaUrl?.split('.').pop()?.toUpperCase() || 'FILE';
        
        return (
          <div className="mb-2">
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                isOutbound 
                  ? 'bg-green-400 border-green-300 hover:bg-green-300 text-white' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <FileText className="w-8 h-8 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className={`text-xs ${
                  isOutbound ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {fileExtension} • Click to open
                </p>
              </div>
              <Download className="w-4 h-4 ml-2 flex-shrink-0" />
            </a>
          </div>
        );
      
      case 'video':
        return (
          <div className="mb-2">
            <video 
              controls 
              className="max-w-full h-auto rounded-lg"
              style={{ 
                maxHeight: window.innerWidth < 768 ? '200px' : '300px', 
                maxWidth: window.innerWidth < 768 ? '200px' : '250px' 
              }}
            >
              <source src={message.mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="mb-2">
            <audio 
              controls 
              className="w-full max-w-xs"
            >
              <source src={message.mediaUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      
      default:
        // Generic media fallback
        return (
          <div className="mb-2">
            <a 
              href={message.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center p-2 rounded border transition-colors ${
                isOutbound 
                  ? 'bg-green-400 border-green-300 hover:bg-green-300 text-white' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              <span className="text-sm">Media file</span>
            </a>
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-3 md:mb-4 px-2 md:px-0`}>
      <div
        className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
          isOutbound
            ? 'bg-green-500 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {/* Render media content first if present */}
        {renderMediaContent()}
        
        {/* Render text content if present */}
        {message.content && message.content.trim() !== '' && (
          <p className="text-sm md:text-base break-words leading-relaxed">{message.content}</p>
        )}
        
        {/* Timestamp and status */}
        <div className={`flex items-center justify-end mt-1 text-xs ${
          isOutbound ? 'text-green-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{format(new Date(message.createdAt), 'HH:mm')}</span>
          {isOutbound && (
            <span className="ml-1 flex-shrink-0">
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