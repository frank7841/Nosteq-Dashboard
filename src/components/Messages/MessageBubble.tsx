import React, { useState } from 'react';
import type { Message } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, FileText, Download, Image as ImageIcon, Copy } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'outbound';
  const hasMedia = message.mediaUrl && message.mediaUrl.trim() !== '';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    if (!message.content) return;
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message.content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = message.content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

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
                  ? 'bg-green-500 border-green-400 hover:bg-green-400 text-white' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}
            >
              <FileText className="w-8 h-8 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className={`text-xs ${
                  isOutbound ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
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
                  ? 'bg-green-500 border-green-400 hover:bg-green-400 text-white' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
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
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-3 md:mb-4 px-2 md:px-0 group`}>
      <div className="relative">
        <div
          className={`group relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm transition-colors ${
            message.direction === 'outbound'
              ? 'bg-green-500 dark:bg-green-600 text-white ml-auto shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow'
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
          message.direction === 'outbound' 
            ? 'text-green-100 dark:text-green-200' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="mr-1">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {message.direction === 'outbound' && (
            <div className="flex items-center">
              {message.status === 'sent' && <Check size={12} className="text-green-200" />}
              {message.status === 'delivered' && <CheckCheck size={12} className="text-green-200" />}
              {message.status === 'read' && <CheckCheck size={12} className="text-blue-300" />}
            </div>
          )}
        </div>
        </div>
        
        {/* Copy Button - appears on hover with high visibility */}
        {message.content && message.content.trim() !== '' && (
          <button
            onClick={handleCopyMessage}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 shadow-lg border ${
              copied
                ? 'opacity-100 bg-green-500 text-white border-green-600 shadow-green-200'
                : isOutbound
                ? 'opacity-0 group-hover:opacity-100 bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 shadow-md'
                : 'opacity-0 group-hover:opacity-100 bg-gray-800 dark:bg-gray-700 text-white border-gray-700 dark:border-gray-600 hover:bg-gray-700 dark:hover:bg-gray-600 hover:border-gray-600 dark:hover:border-gray-500 shadow-md'
            }`}
            title={copied ? 'Copied!' : 'Copy message'}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};