import { useState, useCallback } from 'react';
import { mediaService, type MediaUploadResponse, type SendMediaRequest, type SendMediaResponse } from '../services/media';

interface UseMediaUploadOptions {
  onSuccess?: (response: SendMediaResponse) => void;
  onError?: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
}

interface UseMediaUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadMedia: (file: File, mediaType: 'image' | 'audio' | 'document' | 'video') => Promise<MediaUploadResponse | null>;
  sendMedia: (data: SendMediaRequest) => Promise<SendMediaResponse | null>;
  uploadAndSendMedia: (
    file: File,
    mediaType: 'image' | 'audio' | 'document' | 'video',
    sendData: Omit<SendMediaRequest, 'mediaType' | 'mediaUrl'>
  ) => Promise<SendMediaResponse | null>;
  clearError: () => void;
  validateFile: (file: File, mediaType: 'image' | 'audio' | 'document' | 'video') => boolean;
}

export const useMediaUpload = (options: UseMediaUploadOptions = {}): UseMediaUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError, onUploadProgress } = options;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = useCallback((file: File, mediaType: 'image' | 'audio' | 'document' | 'video'): boolean => {
    const isValid = mediaService.validateFileType(file, mediaType);
    if (!isValid) {
      const errorMsg = `Invalid file type for ${mediaType}. Please select a valid ${mediaType} file.`;
      setError(errorMsg);
      onError?.(errorMsg);
    }
    return isValid;
  }, [onError]);

  const uploadMedia = useCallback(async (
    file: File,
    mediaType: 'image' | 'audio' | 'document' | 'video'
  ): Promise<MediaUploadResponse | null> => {
    if (!validateFile(file, mediaType)) {
      return null;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          onUploadProgress?.(newProgress);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);

      const response = await mediaService.uploadMedia(file, mediaType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      onUploadProgress?.(100);

      if (!response.success) {
        throw new Error('Upload failed');
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload media';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after 1 second
    }
  }, [validateFile, onError, onUploadProgress]);

  const sendMedia = useCallback(async (data: SendMediaRequest): Promise<SendMediaResponse | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await mediaService.sendMedia(data);
      
      if (response.success) {
        onSuccess?.(response);
      } else {
        throw new Error('Failed to send media');
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send media';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [onSuccess, onError]);

  const uploadAndSendMedia = useCallback(async (
    file: File,
    mediaType: 'image' | 'audio' | 'document' | 'video',
    sendData: Omit<SendMediaRequest, 'mediaType' | 'mediaUrl'>
  ): Promise<SendMediaResponse | null> => {
    if (!validateFile(file, mediaType)) {
      return null;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload phase (0-70% progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          onUploadProgress?.(newProgress);
          return newProgress > 70 ? 70 : newProgress;
        });
      }, 100);

      const uploadResponse = await mediaService.uploadMedia(file, mediaType);
      
      if (!uploadResponse.success) {
        throw new Error('Failed to upload media');
      }

      clearInterval(progressInterval);
      setUploadProgress(75);
      onUploadProgress?.(75);

      // Send phase (70-100% progress)
      const sendProgressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          onUploadProgress?.(newProgress);
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 50);

      const sendResponse = await mediaService.sendMedia({
        ...sendData,
        mediaType,
        mediaUrl: uploadResponse.url,
      });

      clearInterval(sendProgressInterval);
      setUploadProgress(100);
      onUploadProgress?.(100);

      if (sendResponse.success) {
        onSuccess?.(sendResponse);
      } else {
        throw new Error('Failed to send media');
      }

      return sendResponse;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload and send media';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after 1 second
    }
  }, [validateFile, onSuccess, onError, onUploadProgress]);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadMedia,
    sendMedia,
    uploadAndSendMedia,
    clearError,
    validateFile,
  };
};
