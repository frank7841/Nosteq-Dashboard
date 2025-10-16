import React, { useState } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import MediaUpload from '../MediaUpload';
import MediaDropZone from '../MediaDropZone';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  conversationId?: number;
  customerId?: number;
  phoneNumber?: string;
  onMediaSent?: (message: any) => void; // Callback when media is successfully sent
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled, 
  conversationId,
  customerId,
  phoneNumber,
  onMediaSent 
}) => {
  const [message, setMessage] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMediaSent = (response: any) => {
    // Close upload interfaces after successful upload
    setShowMediaUpload(false);
    setShowDropZone(false);
    
    // Notify parent component that media was sent successfully
    if (onMediaSent) {
      onMediaSent(response);
    }
    
    console.log('Media sent successfully:', response);
  };

  const handleMediaError = (error: string) => {
    console.error('Media upload error:', error);
    // You could show a toast notification here
  };

  const handleAttachmentClick = () => {
    setShowMediaUpload(!showMediaUpload);
    if (showDropZone) setShowDropZone(false);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 md:p-4">
  <div className="flex items-end space-x-2 md:space-x-3">
    <button
      type="button"
      onClick={handleAttachmentClick}
      className={`p-2 md:p-2.5 transition-colors rounded-lg touch-manipulation ${
        showMediaUpload 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      disabled={disabled}
      title="Attach media"
    >
      <Paperclip className="w-5 h-5 md:w-5 md:h-5" />
    </button>
    <button
      type="button"
      className="p-2 md:p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg touch-manipulation hover:bg-gray-50 dark:hover:bg-gray-800"
      disabled={disabled}
    >
      <Smile className="w-5 h-5 md:w-5 md:h-5" />
    </button>
    <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Type a message..."
      className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 md:px-4 py-2 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 max-h-32 text-sm md:text-base"
      rows={1}
      disabled={disabled}
    />
    <button
      type="submit"
      disabled={!message.trim() || disabled}
      className="bg-green-600 dark:bg-green-700 text-white p-2.5 md:p-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
    >
      <Send className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  </div>
</form>

{/* Media Upload Interface */}
{showMediaUpload && conversationId && customerId && phoneNumber && (
  <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <div className="flex justify-between items-center px-3 md:px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <h4 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Upload Media</h4>
      <button 
        onClick={() => setShowMediaUpload(false)}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 rounded touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700"
        type="button"
      >
        <X size={20} />
      </button>
    </div>
    <div className="p-3 md:p-4">
      <MediaUpload
        conversationId={conversationId}
        customerId={customerId}
        phoneNumber={phoneNumber}
        onMediaSent={handleMediaSent}
        onError={handleMediaError}
      />
    </div>
  </div>
)}

{/* Drag & Drop Zone */}
{showDropZone && conversationId && customerId && phoneNumber && (
  <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full">
    <div className="flex justify-between items-center px-3 md:px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <h4 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Drag & Drop Upload</h4>
      <button 
        onClick={() => setShowDropZone(false)}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 rounded touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700"
        type="button"
      >
        <X size={20} />
      </button>
    </div>
    <div className="p-3 md:p-4">
      <MediaDropZone
        conversationId={conversationId}
        customerId={customerId}
        phoneNumber={phoneNumber}
        onMediaSent={handleMediaSent}
        onError={handleMediaError}
      />
    </div>
  </div>
)}
  </>
  );
};