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
    <div className={`w-full max-w-2xl mx-auto max-h-[70vh] overflow-y-auto ${className}`} style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Drop Area */}
      <div
        className={`relative min-h-[120px] md:min-h-[200px] border-2 border-dashed rounded-xl p-4 md:p-10 text-center cursor-pointer transition-all duration-300 flex items-center justify-center ${
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
          <div className="space-y-2 md:space-y-4">
            <div className="text-3xl md:text-6xl">📁</div>
            <div>
              <p className="text-sm md:text-lg font-semibold text-gray-700 mb-1 md:mb-2">
                {isDragOver ? 'Drop files here!' : 'Drag & drop files here'}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                or click to browse files
              </p>
            </div>
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
                <div className="flex items-center justify-between p-2 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2 ml-2 md:ml-4">
                  <input
                    type="text"
                    placeholder="Add caption..."
                    value={captions[index] || ''}
                    onChange={(e) => setCaptions(prev => ({ ...prev, [index]: e.target.value }))}
                    className="px-2 md:px-3 py-1 text-xs md:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20 md:w-auto"
                    disabled={isUploading}
                  />
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="p-1 md:p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    title="Remove file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bulk Actions */}
          <div className="mt-3 md:mt-6 flex justify-center">
            <button
              onClick={handleSendAll}
              disabled={selectedFiles.length === 0 || isUploading}
              className="px-4 md:px-8 py-2 md:py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg text-sm md:text-base touch-manipulation"
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
