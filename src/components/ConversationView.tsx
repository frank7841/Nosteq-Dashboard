import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Image, Send, X } from 'lucide-react';
import MediaUpload from './MediaUpload';
import MediaDropZone from './MediaDropZone';
import type { Message, Conversation } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { conversationsService, messagesService } from '../services/convsersations';

interface ConversationViewProps {
  conversationId: number;
  onClose?: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId, onClose }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversationData();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationData = async () => {
    try {
      setLoading(true);
      const [conversationData, messagesData] = await Promise.all([
        conversationsService.getOne(conversationId),
        messagesService.getByConversation(conversationId)
      ]);
      
      setConversation(conversationData);
      setMessages(messagesData);
    } catch (err) {
      setError('Failed to load conversation data');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    setSending(true);
    try {
      const messageData = {
        conversationId: conversation.id,
        customerId: conversation.customerId,
        content: newMessage.trim(),
        phoneNumber: conversation.customer?.phoneNumber || '',
      };

      const sentMessage = await messagesService.sendMessage(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleMediaSent = (response: any) => {
    // Refresh messages to show the sent media
    messagesService.getByConversation(conversationId)
      .then(updatedMessages => setMessages(updatedMessages))
      .catch(err => console.error('Error refreshing messages:', err));
    
    setShowMediaUpload(false);
    setShowDropZone(false);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p>Conversation not found</p>
        {onClose && (
          <button onClick={onClose} className="bg-none border-none text-2xl cursor-pointer text-gray-600 p-0 w-8 h-8 flex items-center justify-center">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-[800px] border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="customer-info">
          <h3 className="m-0 mb-1 text-gray-800">{conversation.customer?.name || 'Unknown Customer'}</h3>
          <p className="m-0 text-gray-600 text-sm">{conversation.customer?.phoneNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-xl text-xs font-medium uppercase ${
            conversation.status === 'open' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {conversation.status}
          </span>
          {onClose && (
            <button onClick={onClose} className="bg-transparent border-none text-2xl cursor-pointer text-gray-600 p-0 w-8 h-8 flex items-center justify-center">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-b border-red-500 text-red-800">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="ml-auto bg-transparent border-none text-lg cursor-pointer text-red-800">
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-100">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`mb-4 flex flex-col ${
                (message.direction || 'outbound') === 'inbound' ? 'items-start' : 'items-end'
              }`}
            >
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl break-words ${
                (message.direction || 'outbound') === 'inbound' 
                  ? 'bg-white rounded-bl-sm' 
                  : 'bg-blue-500 text-white rounded-br-sm'
              }`}>
                {message.mediaUrl ? (
                  <div className="flex flex-col gap-2">
                    {message.mediaType === 'image' && (
                      <img 
                        src={message.mediaUrl} 
                        alt={message.content || 'Image'} 
                        className="max-w-[300px] max-h-[200px] rounded-lg object-cover"
                      />
                    )}
                    {message.mediaType === 'document' && (
                      <div className="flex items-center gap-2 p-2 bg-black bg-opacity-10 rounded-lg">
                        <div className="text-2xl">📄</div>
                        <a 
                          href={message.mediaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-inherit no-underline hover:underline"
                        >
                          {message.content || 'Document'}
                        </a>
                      </div>
                    )}
                    {message.mediaType === 'audio' && (
                      <audio controls className="max-w-[300px] rounded-lg">
                        <source src={message.mediaUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {message.mediaType === 'video' && (
                      <video controls className="max-w-[300px] rounded-lg">
                        <source src={message.mediaUrl} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    )}
                    {message.content && (
                      <p className="m-0 text-sm opacity-90">{message.content}</p>
                    )}
                  </div>
                ) : (
                  <p className="m-0 leading-relaxed">{message.content}</p>
                )}
              </div>
              <div className={`mt-1 text-xs text-gray-600 ${
                (message.direction || 'outbound') === 'outbound' ? 'text-right' : ''
              }`}>
                <span className="message-time">
                  {formatMessageTime(message.createdAt || new Date().toISOString())}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Upload Areas */}
      {showDropZone && conversation && (
        <div className="border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="m-0 text-gray-800">Drag & Drop Upload</h4>
            <button 
              onClick={() => setShowDropZone(false)}
              className="bg-transparent border-none text-xl cursor-pointer text-gray-600 hover:text-gray-800"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
          <MediaDropZone
            conversationId={conversation.id}
            customerId={conversation.customerId}
            phoneNumber={conversation.customer?.phoneNumber || ''}
            onMediaSent={handleMediaSent}
            onError={handleError}
          />
        </div>
      )}

      {showMediaUpload && conversation && (
        <div className="border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="m-0 text-gray-800">Media Upload</h4>
            <button 
              onClick={() => setShowMediaUpload(false)}
              className="bg-transparent border-none text-xl cursor-pointer text-gray-600 hover:text-gray-800"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
          <MediaUpload
            conversationId={conversation.id}
            customerId={conversation.customerId}
            phoneNumber={conversation.customer?.phoneNumber || ''}
            onMediaSent={handleMediaSent}
            onError={handleError}
          />
        </div>
      )}

      {/* Debug Info */}
      <div className="px-5 py-2 bg-yellow-50 border-t border-yellow-200 text-xs text-yellow-800">
        Debug: showDropZone={showDropZone.toString()}, showMediaUpload={showMediaUpload.toString()}, hasConversation={!!conversation}
      </div>

      {/* Message Input */}
      <div className="flex items-end gap-2 px-5 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔧 Paperclip button clicked! Current state:', {
                showDropZone,
                showMediaUpload,
                conversation: !!conversation
              });
              setShowDropZone(prev => {
                console.log('🔧 Setting showDropZone from', prev, 'to', !prev);
                return !prev;
              });
              if (showMediaUpload) {
                console.log('🔧 Closing media upload');
                setShowMediaUpload(false);
              }
            }}
            className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 ${
              showDropZone 
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Drag & Drop Upload"
            style={{ border: 'none', outline: 'none' }}
          >
            <Paperclip size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔧 Image button clicked! Current state:', {
                showDropZone,
                showMediaUpload,
                conversation: !!conversation
              });
              setShowMediaUpload(prev => {
                console.log('🔧 Setting showMediaUpload from', prev, 'to', !prev);
                return !prev;
              });
              if (showDropZone) {
                console.log('🔧 Closing drop zone');
                setShowDropZone(false);
              }
            }}
            className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 ${
              showMediaUpload 
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Media Upload"
            style={{ border: 'none', outline: 'none' }}
          >
            <Image size={18} />
          </button>
        </div>
        
        <div className="flex-1 flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-[120px] px-4 py-2.5 border border-gray-300 rounded-full resize-none font-inherit text-sm leading-relaxed focus:outline-none focus:border-blue-500"
            rows={1}
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 border-none rounded-full bg-blue-500 text-white cursor-pointer flex items-center justify-center transition-colors hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ConversationView;
