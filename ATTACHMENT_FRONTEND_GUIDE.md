# Invoice Attachments Frontend Implementation Guide

## Overview

The frontend attachment system provides a complete file management interface for invoice attachments with drag-and-drop upload, preview capabilities, and comprehensive file management features.

## Architecture

### Component Structure

```
src/
├── types/
│   └── attachment.ts          # TypeScript interfaces and types
├── services/
│   └── attachmentService.ts   # API service layer
├── hooks/
│   ├── useInvoiceAttachments.ts     # Main attachment state management
│   ├── useAttachmentDragDrop.ts     # Drag & drop functionality
│   └── useAttachmentPreview.ts      # Preview modal management
└── components/
    └── attachments/
        ├── index.ts                 # Component exports
        ├── InvoiceAttachments.tsx   # Main attachment component
        ├── AttachmentUpload.tsx     # Upload component
        ├── AttachmentItem.tsx       # Individual attachment display
        └── AttachmentPreview.tsx    # Preview modal
```

## Components

### 1. InvoiceAttachments (Main Component)

The primary component that orchestrates all attachment functionality.

**Props:**

```typescript
interface AttachmentListProps {
  invoiceId: number;
  invoiceNumber: string;
  readOnly?: boolean;
  maxHeight?: string;
  showStats?: boolean;
  allowMultipleSelection?: boolean;
  onAttachmentSelect?: (attachment: InvoiceAttachment) => void;
  onAttachmentsChange?: (attachments: InvoiceAttachment[]) => void;
}
```

**Features:**

- Upload panel with drag-and-drop
- Search and filter capabilities
- Grid/List view modes
- Bulk operations (select all, download, delete)
- Real-time stats display
- Error handling and loading states

**Usage:**

```tsx
<InvoiceAttachments
  invoiceId={123}
  invoiceNumber="INV-2024-001"
  readOnly={false}
  maxHeight="500px"
  showStats={true}
  allowMultipleSelection={true}
/>
```

### 2. AttachmentUpload

Handles file upload with drag-and-drop support and progress tracking.

**Features:**

- Drag-and-drop interface
- File validation (size, type, extension)
- Upload progress tracking
- Multiple file support
- Error handling

**Configuration:**

- Max file size: 10MB (configurable)
- Supported types: PDF, JPG, JPEG, PNG, GIF
- Multiple files: Configurable
- Progress tracking: Optional

### 3. AttachmentItem

Displays individual attachment items in list or grid view.

**Features:**

- Two view modes: list and grid
- Inline description editing
- Action buttons (view, download, edit, delete)
- File type icons
- Selection support

### 4. AttachmentPreview

Modal component for previewing attachments.

**Features:**

- Image preview with zoom and rotation
- PDF inline viewing
- Keyboard navigation (arrows, ESC, zoom controls)
- Navigation between attachments
- Fullscreen mode
- Download functionality

**Keyboard Shortcuts:**

- `Escape`: Close preview
- `←/→`: Navigate between attachments
- `+/-`: Zoom in/out
- `0`: Reset zoom
- `R`: Rotate image

## Hooks

### useInvoiceAttachments

Main hook for attachment state management.

```typescript
const {
  attachments,
  stats,
  loading,
  error,
  uploadAttachment,
  updateAttachment,
  deleteAttachment,
  downloadAttachment,
  searchAttachments,
  filterByType,
  refreshAttachments,
  clearError,
} = useInvoiceAttachments(invoiceId);
```

### useAttachmentDragDrop

Handles drag-and-drop functionality.

```typescript
const { isDragActive, getRootProps, getInputProps } = useAttachmentDragDrop(
  onFilesSelected,
  {
    maxFiles: 10,
    disabled: false,
  }
);
```

### useAttachmentPreview

Manages preview modal state and navigation.

```typescript
const {
  previewData,
  isOpen,
  openPreview,
  closePreview,
  navigateNext,
  navigatePrevious,
  canNavigateNext,
  canNavigatePrevious,
} = useAttachmentPreview(attachments, invoiceId);
```

## API Integration

### AttachmentService

Centralized service for all attachment-related API calls.

**Methods:**

- `getAttachments(invoiceId)` - Fetch all attachments
- `uploadAttachment(invoiceId, formData, onProgress)` - Upload with progress
- `updateAttachment(invoiceId, attachmentId, data)` - Update description
- `deleteAttachment(invoiceId, attachmentId)` - Delete attachment
- `downloadAttachment(invoiceId, attachmentId, fileName)` - Download file
- `searchAttachments(invoiceId, query)` - Search by description
- `filterAttachmentsByType(invoiceId, type)` - Filter by type
- `getAttachmentStats(invoiceId)` - Get storage statistics

**Authentication:**
The service automatically handles authentication tokens from localStorage.

**Error Handling:**
All methods throw errors that are caught and handled by the components.

## Integration with Invoice Edit Page

The attachment functionality is integrated as a new tab in the invoice edit page:

```tsx
// Added to invoice edit page
import InvoiceAttachments from "@/components/attachments/InvoiceAttachments";

// Updated TabsList
<TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="details">Invoice Details</TabsTrigger>
    <TabsTrigger value="documents">Additional Documents</TabsTrigger>
    <TabsTrigger value="attachments">Attachments</TabsTrigger>
</TabsList>

// New TabsContent
<TabsContent value="attachments">
    <InvoiceAttachments
        invoiceId={editingInvoice.id}
        invoiceNumber={editingInvoice.invoice_number}
        readOnly={false}
        maxHeight="500px"
        showStats={true}
        allowMultipleSelection={true}
    />
</TabsContent>
```

## Styling and UI

### Tailwind CSS Classes

The components use Tailwind CSS for styling with consistent design patterns:

- **Colors**: Blue for primary actions, red for errors, green for success
- **Spacing**: Consistent spacing using Tailwind scale
- **Transitions**: Smooth animations for hover states and loading
- **Responsive**: Mobile-first responsive design

### Icons

Uses Lucide React icons throughout:

- `Upload` - Upload functionality
- `FileText` - PDF files
- `Image` - Image files
- `Download` - Download actions
- `Eye` - Preview actions
- `Edit2` - Edit actions
- `Trash2` - Delete actions

## Error Handling

### Client-Side Validation

- File size validation (max 10MB)
- File type validation (PDF, images only)
- File extension validation
- Description length validation

### Server-Side Error Handling

- Network errors with retry capabilities
- Authentication errors
- File upload errors with detailed messages
- Server validation errors

### User Feedback

- Toast notifications for success/error states
- Loading spinners during operations
- Progress bars for uploads
- Error messages with dismissal options

## Performance Optimizations

### Lazy Loading

- Components only render when needed
- Images loaded on demand in preview

### Memory Management

- Proper cleanup of event listeners
- File URL cleanup after downloads
- Component unmounting safety checks

### API Optimization

- Debounced search queries
- Optimistic UI updates
- Efficient re-fetching strategies

## Configuration

### Environment Variables

```env
# API base URL (configured in service)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Upload configuration (handled by backend)
ATTACHMENT_MAX_FILE_SIZE=10485760
ATTACHMENT_MAX_FILES_PER_INVOICE=50
```

### TypeScript Configuration

All components are fully typed with comprehensive interfaces:

- `InvoiceAttachment` - Main attachment interface
- `AttachmentFormData` - Upload form data
- `AttachmentStats` - Storage statistics
- Component prop interfaces
- Hook return type interfaces

## Testing Considerations

### Unit Testing

Test coverage should include:

- Hook functionality
- Component rendering
- API service methods
- File validation logic

### Integration Testing

- Upload workflow
- Preview functionality
- Search and filter
- Error scenarios

### E2E Testing

- Complete attachment workflow
- Cross-browser compatibility
- Mobile responsiveness

## Accessibility

### Keyboard Navigation

- Tab navigation through all interactive elements
- Keyboard shortcuts for preview modal
- Screen reader support

### ARIA Labels

- Descriptive labels for all buttons
- Status announcements for uploads
- Error message associations

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- File API support required
- Drag-and-drop API support required

## Security Considerations

### File Validation

- Client-side file type checking
- File size limitations
- MIME type validation

### Authentication

- Token-based authentication
- Automatic token refresh handling
- Secure file access URLs

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file size and type restrictions
2. **Preview Not Working**: Verify MIME type support
3. **Authentication Errors**: Check token validity
4. **Performance Issues**: Monitor file sizes and quantities

### Debug Mode

Enable detailed logging by setting localStorage debug flag:

```javascript
localStorage.setItem("attachment_debug", "true");
```

## Future Enhancements

### Planned Features

- Batch upload with folder support
- Version control for attachments
- Advanced file compression
- Cloud storage integration
- Advanced search with metadata

### Performance Improvements

- Virtual scrolling for large lists
- Image thumbnail generation
- Progressive loading
- Caching strategies

## Migration Guide

### From Existing Systems

1. Ensure backend API is implemented
2. Update invoice edit page imports
3. Add new tab to existing tabs
4. Test all functionality
5. Deploy with feature flags if needed

### Configuration Updates

No breaking changes to existing functionality. The new attachment feature is additive and doesn't affect existing document management.
