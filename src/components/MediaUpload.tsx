import React, { useState, useRef } from 'react';
import { mediaService, type SendMediaRequest } from '../services/media';

interface MediaUploadProps {
  conversationId: number;
  customerId: number;
  phoneNumber: string;
  onMediaSent?: (response: any) => void;
  onError?: (error: string) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  conversationId,
  customerId,
  phoneNumber,
  onMediaSent,
  onError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'document' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!mediaService.validateFileType(file, mediaType)) {
      onError?.(`Invalid file type for ${mediaType}. Please select a valid ${mediaType} file.`);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (mediaType === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleMediaTypeChange = (newMediaType: 'image' | 'audio' | 'document' | 'video') => {
    setMediaType(newMediaType);
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAndSend = async () => {
    if (!selectedFile) {
      onError?.('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const sendData: Omit<SendMediaRequest, 'mediaType' | 'mediaUrl'> = {
        conversationId,
        customerId,
        phoneNumber,
        caption: caption.trim() || selectedFile.name,
      };

      const response = await mediaService.uploadAndSendMedia(selectedFile, mediaType, sendData);
      
      if (response.success) {
        onMediaSent?.(response);
        // Reset form
        setSelectedFile(null);
        setCaption('');
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        onError?.('Failed to send media');
      }
    } catch (error) {
      console.error('Error uploading and sending media:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload and send media');
    } finally {
      setIsUploading(false);
    }
  };

  const getAcceptedFileTypes = () => {
    switch (mediaType) {
      case 'image':
        return 'image/*';
      case 'audio':
        return 'audio/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx';
      default:
        return '*/*';
    }
  };

  return (
    <div className="p-3 md:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm max-h-[70vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
    {/* Media Type Selector */}
    <div className="mb-3 md:mb-6">
      <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-3">Media Type:</label>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {(['image', 'audio', 'document', 'video'] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`px-2 md:px-4 py-1 md:py-2 rounded-lg border transition-all duration-200 font-medium text-xs md:text-sm ${
              mediaType === type
                ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600 shadow-md'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            } disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
            onClick={() => handleMediaTypeChange(type)}
            disabled={isUploading}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  
    {/* File Input Section */}
    <div className="mb-3 md:mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedFileTypes()}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="w-full p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded-lg file:border-0 file:text-xs md:file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      
      {selectedFile && (
        <div className="mt-2 md:mt-4 p-2 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="space-y-1 md:space-y-2">
            <p className="text-xs md:text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Selected:</span> <span className="text-gray-600 dark:text-gray-400 truncate">{selectedFile.name}</span></p>
            <p className="text-xs md:text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Size:</span> <span className="text-gray-600 dark:text-gray-400">{mediaService.formatFileSize(selectedFile.size)}</span></p>
            <p className="text-xs md:text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Type:</span> <span className="text-gray-600 dark:text-gray-400">{selectedFile.type}</span></p>
          </div>
        </div>
      )}
  
      {preview && (
        <div className="mt-2 md:mt-4 text-center">
          <div className="inline-block p-1 md:p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-[120px] md:max-w-[200px] max-h-[120px] md:max-h-[200px] rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  
    {/* Caption Section */}
    <div className="mb-3 md:mb-6">
      <label htmlFor="caption" className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
        Caption (optional):
      </label>
      <input
        id="caption"
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Enter a caption for your media..."
        disabled={isUploading}
        className="w-full p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed placeholder-gray-400 dark:placeholder-gray-500 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>
  
    {/* Upload Actions */}
    <div className="text-center">
      <button
        onClick={handleUploadAndSend}
        disabled={!selectedFile || isUploading}
        className="px-4 md:px-8 py-2 md:py-3 bg-green-500 dark:bg-green-600 text-white font-semibold rounded-lg hover:bg-green-600 dark:hover:bg-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg text-sm md:text-base touch-manipulation"
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading & Sending...
          </div>
        ) : (
          'Upload & Send'
        )}
      </button>
    </div>
  </div>
  );
};

export default MediaUpload;
