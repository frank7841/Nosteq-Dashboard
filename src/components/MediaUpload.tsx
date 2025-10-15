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
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Media Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Media Type:</label>
        <div className="flex flex-wrap gap-2">
          {(['image', 'audio', 'document', 'video'] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium text-sm ${
                mediaType === type
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => handleMediaTypeChange(type)}
              disabled={isUploading}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* File Input Section */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedFileTypes()}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <p className="text-sm"><span className="font-semibold text-gray-700">Selected:</span> <span className="text-gray-600">{selectedFile.name}</span></p>
              <p className="text-sm"><span className="font-semibold text-gray-700">Size:</span> <span className="text-gray-600">{mediaService.formatFileSize(selectedFile.size)}</span></p>
              <p className="text-sm"><span className="font-semibold text-gray-700">Type:</span> <span className="text-gray-600">{selectedFile.type}</span></p>
            </div>
          </div>
        )}

        {preview && (
          <div className="mt-4 text-center">
            <div className="inline-block p-2 bg-gray-50 rounded-lg border border-gray-200">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-[200px] max-h-[200px] rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Caption Section */}
      <div className="mb-6">
        <label htmlFor="caption" className="block text-sm font-semibold text-gray-700 mb-2">
          Caption (optional):
        </label>
        <input
          id="caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Enter a caption for your media..."
          disabled={isUploading}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400"
        />
      </div>

      {/* Upload Actions */}
      <div className="text-center">
        <button
          onClick={handleUploadAndSend}
          disabled={!selectedFile || isUploading}
          className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
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
