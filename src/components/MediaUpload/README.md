# WhatsApp Media Upload Components

This package provides comprehensive media upload functionality for your WhatsApp dashboard, including file upload, validation, and sending capabilities.

## Components Overview

### 1. MediaService (`/src/services/media.ts`)
Core service for handling media uploads and WhatsApp message sending.

**Key Functions:**
- `uploadMedia(file, mediaType)` - Upload media to server
- `sendMedia(data)` - Send media via WhatsApp
- `uploadAndSendMedia(file, mediaType, sendData)` - Combined upload and send
- `validateFileType(file, mediaType)` - File validation
- `formatFileSize(bytes)` - Human-readable file sizes

### 2. MediaUpload Component (`/src/components/MediaUpload.tsx`)
Traditional file upload component with media type selection.

**Features:**
- Media type selector (image, audio, document, video)
- File validation
- Image preview
- Caption input
- Upload progress indication

### 3. MediaDropZone Component (`/src/components/MediaDropZone.tsx`)
Modern drag-and-drop upload interface.

**Features:**
- Drag and drop file upload
- Multiple file selection
- Individual file captions
- Bulk upload functionality
- Progress tracking
- File type validation

### 4. useMediaUpload Hook (`/src/hooks/useMediaUpload.ts`)
Custom React hook for media upload logic.

**Features:**
- Upload state management
- Progress tracking
- Error handling
- File validation
- Success/error callbacks

### 5. ConversationView Component (`/src/components/ConversationView.tsx`)
Complete conversation interface with integrated media upload.

**Features:**
- Message display with media support
- Integrated media upload buttons
- Real-time message updates
- Media message rendering

## Quick Start

### Basic Usage

```tsx
import MediaUpload from './components/MediaUpload';

function MyComponent() {
  const handleMediaSent = (response) => {
    console.log('Media sent successfully:', response);
  };

  const handleError = (error) => {
    console.error('Upload error:', error);
  };

  return (
    <MediaUpload
      conversationId={123}
      customerId={456}
      phoneNumber="254790943918"
      onMediaSent={handleMediaSent}
      onError={handleError}
    />
  );
}
```

### Drag & Drop Usage

```tsx
import MediaDropZone from './components/MediaDropZone';

function MyComponent() {
  return (
    <MediaDropZone
      conversationId={123}
      customerId={456}
      phoneNumber="254790943918"
      onMediaSent={(response) => console.log('Success:', response)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

### Using the Hook

```tsx
import { useMediaUpload } from './hooks/useMediaUpload';

function MyComponent() {
  const { 
    isUploading, 
    uploadProgress, 
    error, 
    uploadAndSendMedia,
    clearError 
  } = useMediaUpload({
    onSuccess: (response) => console.log('Success:', response),
    onError: (error) => console.error('Error:', error),
  });

  const handleFileUpload = async (file) => {
    await uploadAndSendMedia(file, 'image', {
      conversationId: 123,
      customerId: 456,
      phoneNumber: '254790943918',
      caption: 'My image caption'
    });
  };

  return (
    <div>
      {isUploading && <p>Uploading... {uploadProgress}%</p>}
      {error && <p>Error: {error}</p>}
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
      />
    </div>
  );
}
```

## API Endpoints

The components use these API endpoints:

### Upload Endpoints
- `POST /api/upload/image` - Upload image files
- `POST /api/upload/audio` - Upload audio files  
- `POST /api/upload/document` - Upload document files
- `POST /api/upload/video` - Upload video files

**Request Format:** `multipart/form-data` with `file` key

**Response Format:**
```json
{
  "success": true,
  "filename": "file-1760505219052-488682437.png",
  "originalName": "Screenshot from 2025-04-24 16-50-56.png", 
  "size": 386313,
  "url": "https://chat.nosteq.co.ke/uploads/images/file-1760505219052-488682437.png",
  "type": "image"
}
```

### Send Media Endpoint
- `POST /api/messages/send-media` - Send uploaded media via WhatsApp

**Request Format:**
```json
{
  "conversationId": 1,
  "customerId": 1, 
  "phoneNumber": "254790943918",
  "mediaType": "image",
  "mediaUrl": "https://chat.nosteq.co.ke/uploads/images/file-1760505219052-488682437.png",
  "caption": "Optional caption"
}
```

## Supported File Types

### Images
- JPEG, PNG, GIF, WebP
- Automatic preview generation

### Audio  
- MP3, WAV, OGG, M4A
- Audio player controls

### Video
- MP4, WebM, AVI, MOV
- Video player controls  

### Documents
- PDF, DOC, DOCX, TXT, RTF
- XLS, XLSX, PPT, PPTX
- Download links

## Configuration

### Environment Variables
Make sure your `.env` file includes:
```
VITE_API_URL=https://chat.nosteq.co.ke
```

### File Size Limits
Default limits (can be configured on server):
- Images: 10MB
- Audio: 50MB  
- Video: 100MB
- Documents: 25MB

## Error Handling

All components include comprehensive error handling:

- File type validation
- File size validation  
- Network error handling
- Upload progress tracking
- User-friendly error messages

## Styling

Components use CSS-in-JS for styling. You can customize by:

1. Overriding CSS classes
2. Passing custom className props
3. Modifying the style objects in components

## Integration Examples

### In a Chat Interface
```tsx
import ConversationView from './components/ConversationView';

function ChatPage() {
  return (
    <ConversationView 
      conversationId={123}
      onClose={() => navigate('/conversations')}
    />
  );
}
```

### In a Modal
```tsx
import MediaDropZone from './components/MediaDropZone';

function MediaModal({ isOpen, conversationData }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <MediaDropZone
        conversationId={conversationData.id}
        customerId={conversationData.customerId}
        phoneNumber={conversationData.phoneNumber}
        onMediaSent={() => setIsOpen(false)}
      />
    </div>
  );
}
```

## Testing

To test the media upload functionality:

1. Start your development server
2. Navigate to a conversation
3. Try uploading different file types
4. Verify files appear in WhatsApp
5. Check error handling with invalid files

## Troubleshooting

### Common Issues

**Upload fails with 401 error:**
- Check authentication token
- Verify API_URL configuration

**File type not supported:**
- Check `validateFileType` function
- Verify server accepts the file type

**Large files fail:**
- Check server file size limits
- Consider implementing chunked uploads

**Progress not updating:**
- Verify `onUploadProgress` callback
- Check network connection

### Debug Mode
Enable debug logging:
```tsx
const { uploadAndSendMedia } = useMediaUpload({
  onSuccess: (response) => {
    console.log('Upload success:', response);
  },
  onError: (error) => {
    console.error('Upload error:', error);
  },
  onUploadProgress: (progress) => {
    console.log('Upload progress:', progress + '%');
  }
});
```

## Contributing

When adding new features:

1. Update type definitions
2. Add error handling
3. Include progress tracking
4. Update documentation
5. Test with different file types

## License

This media upload system is part of the WhatsApp Dashboard project.
