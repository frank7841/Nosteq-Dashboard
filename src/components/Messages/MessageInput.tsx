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
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end space-x-2">
        <button
          type="button"
          onClick={handleAttachmentClick}
          className={`p-2 transition-colors rounded-lg ${
            showMediaUpload 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          disabled={disabled}
          title="Attach media"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 transition"
          disabled={disabled}
        >
          <Smile className="w-5 h-5" />
        </button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32"
          rows={1}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>

    {/* Media Upload Interface */}
    {showMediaUpload && conversationId && customerId && phoneNumber && (
      <div className="border-t border-gray-200 bg-white">
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800">Upload Media</h4>
          <button 
            onClick={() => setShowMediaUpload(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
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
      <div className="border-t border-gray-200 bg-white">
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800">Drag & Drop Upload</h4>
          <button 
            onClick={() => setShowDropZone(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
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