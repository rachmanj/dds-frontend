export interface InvoiceAttachment {
  id: number;
  invoice_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  formatted_file_size: string;
  mime_type: string;
  file_extension: string;
  description: string | null;
  is_image: boolean;
  is_pdf: boolean;
  file_url: string;
  uploader: {
    id: number;
    name: string;
  };
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

export interface AttachmentFormData {
  file: File;
  description?: string;
}

export interface AttachmentUploadResponse {
  success: boolean;
  message: string;
  data: InvoiceAttachment;
}

export interface AttachmentListResponse {
  success: boolean;
  data: InvoiceAttachment[];
  stats: AttachmentStats;
}

export interface AttachmentStats {
  total_files: number;
  total_size: number;
  formatted_total_size: string;
  file_types: Record<string, number>;
}

export interface AttachmentResponse {
  success: boolean;
  data: InvoiceAttachment;
}

export interface AttachmentErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export interface AttachmentStatsResponse {
  success: boolean;
  data: AttachmentStats;
}

export interface AttachmentSearchResponse {
  success: boolean;
  data: InvoiceAttachment[];
  search_query: string;
}

export interface AttachmentTypeFilterResponse {
  success: boolean;
  data: InvoiceAttachment[];
  type: "images" | "pdfs" | "all";
}

export interface AttachmentUpdateData {
  description: string;
}

export interface AttachmentValidationError {
  field: string;
  message: string;
}

export interface AttachmentUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface AttachmentPreviewData {
  attachment: InvoiceAttachment;
  previewUrl?: string;
  isLoading: boolean;
  error?: string;
}

export interface AttachmentDragDropData {
  files: File[];
  isDragging: boolean;
  dragCounter: number;
}

// Configuration types
export interface AttachmentConfig {
  maxFileSize: number; // in bytes
  maxFilesPerInvoice: number;
  allowedFileTypes: string[];
  allowedExtensions: string[];
  acceptString: string; // for HTML input accept attribute
}

// UI State types
export interface AttachmentUIState {
  selectedAttachments: number[];
  viewMode: "grid" | "list";
  sortBy: "name" | "date" | "size" | "type";
  sortOrder: "asc" | "desc";
  filterType: "all" | "images" | "pdfs";
  searchQuery: string;
  isUploading: boolean;
  uploadProgress: Record<string, AttachmentUploadProgress>;
  error?: string;
}

// Action types for reducers
export type AttachmentAction =
  | { type: "SET_ATTACHMENTS"; payload: InvoiceAttachment[] }
  | { type: "ADD_ATTACHMENT"; payload: InvoiceAttachment }
  | { type: "UPDATE_ATTACHMENT"; payload: InvoiceAttachment }
  | { type: "DELETE_ATTACHMENT"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "SET_UPLOAD_PROGRESS";
      payload: { key: string; progress: AttachmentUploadProgress };
    }
  | { type: "SET_FILTER_TYPE"; payload: "all" | "images" | "pdfs" }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_SORT"; payload: { sortBy: string; sortOrder: "asc" | "desc" } }
  | { type: "TOGGLE_SELECTION"; payload: number }
  | { type: "SELECT_ALL"; payload: number[] }
  | { type: "CLEAR_SELECTION" };

// Component prop types
export interface AttachmentListProps {
  invoiceId: number;
  invoiceNumber: string;
  readOnly?: boolean;
  maxHeight?: string;
  showStats?: boolean;
  allowMultipleSelection?: boolean;
  onAttachmentSelect?: (attachment: InvoiceAttachment) => void;
  onAttachmentsChange?: (attachments: InvoiceAttachment[]) => void;
}

export interface AttachmentUploadProps {
  invoiceId: number;
  onUploadSuccess?: (attachment: InvoiceAttachment) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  dragDropEnabled?: boolean;
  showProgress?: boolean;
}

export interface AttachmentItemProps {
  attachment: InvoiceAttachment;
  isSelected?: boolean;
  viewMode: "grid" | "list";
  onSelect?: () => void;
  onView?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export interface AttachmentPreviewProps {
  attachment: InvoiceAttachment | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canNavigate?: boolean;
}

export interface AttachmentStatsProps {
  stats: AttachmentStats;
  className?: string;
  showDetails?: boolean;
}

// Hook return types
export interface UseInvoiceAttachmentsReturn {
  attachments: InvoiceAttachment[];
  stats: AttachmentStats | null;
  loading: boolean;
  error: string | null;
  uploadAttachment: (
    formData: AttachmentFormData
  ) => Promise<InvoiceAttachment>;
  updateAttachment: (
    id: number,
    data: AttachmentUpdateData
  ) => Promise<InvoiceAttachment>;
  deleteAttachment: (id: number) => Promise<boolean>;
  downloadAttachment: (id: number, forceDownload?: boolean) => Promise<void>;
  searchAttachments: (query: string) => Promise<InvoiceAttachment[]>;
  filterByType: (
    type: "images" | "pdfs" | "all"
  ) => Promise<InvoiceAttachment[]>;
  refreshAttachments: () => Promise<void>;
  clearError: () => void;
}

export interface UseAttachmentPreviewReturn {
  previewData: AttachmentPreviewData | null;
  isOpen: boolean;
  openPreview: (attachment: InvoiceAttachment) => Promise<void>;
  closePreview: () => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
}

export interface UseAttachmentDragDropReturn {
  dragData: AttachmentDragDropData;
  isDragActive: boolean;
  getRootProps: () => object;
  getInputProps: () => object;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

// Utility types
export type AttachmentFileType = "pdf" | "image" | "unknown";

export type AttachmentSortField = "name" | "date" | "size" | "type";

export type AttachmentFilterType = "all" | "images" | "pdfs";

export type AttachmentViewMode = "grid" | "list";
