import React, { useState, useRef, useCallback } from 'react';
import { useMediaUpload } from '../hooks/useMediaUpload';

interface MediaDropZoneProps {
  conversationId: number;
  customerId: number;
  phoneNumber: string;
  onMediaSent?: (response: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const MediaDropZone: React.FC<MediaDropZoneProps> = ({
  conversationId,
  customerId,
  phoneNumber,
  onMediaSent,
  onError,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    isUploading, 
    uploadProgress, 
    error, 
    uploadAndSendMedia, 
    clearError,
    validateFile 
  } = useMediaUpload({
    onSuccess: (response) => {
      onMediaSent?.(response);
      setSelectedFiles([]);
      setCaptions({});
    },
    onError: (errorMsg) => {
      onError?.(errorMsg);
    },
  });

  const getMediaTypeFromFile = (file: File): 'image' | 'audio' | 'document' | 'video' => {
    const fileType = file.type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    clearError();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  }, [clearError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleCaptionChange = (fileIndex: number, caption: string) => {
    setCaptions(prev => ({
      ...prev,
      [fileIndex]: caption,
    }));
  };

  const handleSendFile = async (file: File, fileIndex: number) => {
    const mediaType = getMediaTypeFromFile(file);
    const caption = captions[fileIndex] || file.name;

    if (!validateFile(file, mediaType)) {
      return;
    }

    await uploadAndSendMedia(file, mediaType, {
      conversationId,
      customerId,
      phoneNumber,
      caption,
    });
  };

  const handleSendAll = async () => {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      await handleSendFile(file, i);
      // Add a small delay between uploads to avoid overwhelming the server
      if (i < selectedFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setCaptions(prev => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      return newCaptions;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full max-w-2xl mx-auto h-auto ${className}`}>
      {/* Drop Area */}
      <div
        className={`relative min-h-[200px] border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 flex items-center justify-center ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : isUploading
            ? 'border-green-500 bg-green-50 cursor-not-allowed'
            : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Uploading media...</p>
            {uploadProgress > 0 && (
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Drop files here or click to browse</h3>
            <p className="text-gray-600 text-sm mb-3">
              Drag and drop your media files here, or{' '}
              <button type="button" className="text-blue-500 hover:underline font-medium">
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Supported: Images, Audio, Video, Documents (PDF, DOC, TXT, etc.)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <span>⚠️</span>
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="text-red-800 hover:text-red-900 text-lg font-bold">
            ×
          </button>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Selected Files ({selectedFiles.length})
          </h4>
          
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <span className="block font-medium text-gray-800 mb-1">{file.name}</span>
                    <div className="text-xs text-gray-600">
                      {formatFileSize(file.size)} • {getMediaTypeFromFile(file)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Add caption (optional)..."
                    value={captions[index] || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                    disabled={isUploading}
                  />
                  <button
                    onClick={() => handleSendFile(file, index)}
                    disabled={isUploading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Send
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bulk Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <button
              onClick={handleSendAll}
              disabled={isUploading || selectedFiles.length === 0}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                `Send All (${selectedFiles.length})`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDropZone;
