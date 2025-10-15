import { api } from './api';

export interface MediaUploadResponse {
  success: boolean;
  filename: string;
  originalName: string;
  size: number;
  url: string;
  type: string;
}

export interface SendMediaRequest {
  conversationId: number;
  customerId: number;
  phoneNumber: string;
  mediaType: 'image' | 'audio' | 'document' | 'video';
  mediaUrl: string;
  caption?: string;
}

export interface SendMediaResponse {
  success: boolean;
  message: any; // You can define a more specific type based on your Message interface
}

export const mediaService = {
  /**
   * Upload media file to the server
   * @param file - The file to upload
   * @param mediaType - Type of media (image, audio, document, video)
   * @returns Promise with upload response
   */
  uploadMedia: async (file: File, mediaType: 'image' | 'audio' | 'document' | 'video'): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Determine the correct endpoint based on media type
    const endpoint = `/upload/${mediaType}`;

    // Create a new axios instance for form data uploads
    const response = await api.post<MediaUploadResponse>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Send uploaded media via WhatsApp
   * @param data - Media send request data
   * @returns Promise with send response
   */
  sendMedia: async (data: SendMediaRequest): Promise<SendMediaResponse> => {
    const response = await api.post<SendMediaResponse>('/messages/send-media', data);
    return response.data;
  },

  /**
   * Upload and send media in one operation
   * @param file - The file to upload and send
   * @param mediaType - Type of media
   * @param sendData - Additional data for sending (conversationId, customerId, phoneNumber, caption)
   * @returns Promise with send response
   */
  uploadAndSendMedia: async (
    file: File,
    mediaType: 'image' | 'audio' | 'document' | 'video',
    sendData: Omit<SendMediaRequest, 'mediaType' | 'mediaUrl'>
  ): Promise<SendMediaResponse> => {
    try {
      // First upload the media
      const uploadResponse = await mediaService.uploadMedia(file, mediaType);
      
      if (!uploadResponse.success) {
        throw new Error('Failed to upload media');
      }

      // Then send the media via WhatsApp
      const sendResponse = await mediaService.sendMedia({
        ...sendData,
        mediaType,
        mediaUrl: uploadResponse.url,
      });

      return sendResponse;
    } catch (error) {
      console.error('Error uploading and sending media:', error);
      throw error;
    }
  },

  /**
   * Validate file type based on media type
   * @param file - File to validate
   * @param mediaType - Expected media type
   * @returns boolean indicating if file is valid
   */
  validateFileType: (file: File, mediaType: 'image' | 'audio' | 'document' | 'video'): boolean => {
    const fileType = file.type.toLowerCase();
    
    switch (mediaType) {
      case 'image':
        return fileType.startsWith('image/');
      case 'audio':
        return fileType.startsWith('audio/');
      case 'video':
        return fileType.startsWith('video/');
      case 'document':
        // Allow common document types
        return fileType.includes('pdf') || 
               fileType.includes('doc') || 
               fileType.includes('docx') || 
               fileType.includes('txt') || 
               fileType.includes('rtf') ||
               fileType.includes('spreadsheet') ||
               fileType.includes('presentation');
      default:
        return false;
    }
  },

  /**
   * Get human-readable file size
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
