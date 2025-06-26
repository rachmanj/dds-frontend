// File Management & Watermarking Types

export interface InvoiceAttachment {
  id: number;
  invoice_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  formatted_file_size: string;
  mime_type: string;
  description?: string;
  uploaded_by: number;
  is_image: boolean;
  is_pdf: boolean;
  file_extension: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  watermark?: FileWatermark;
  processing_jobs?: FileProcessingJob[];
}

export interface FileWatermark {
  id: number;
  original_file_id: number;
  watermarked_path: string;
  watermark_text: string;
  watermark_type: "text" | "image" | "logo";
  watermark_settings: WatermarkSettings;
  file_size: number;
  human_size: string;
  checksum: string;
  created_at: string;
  exists: boolean;
}

export interface WatermarkSettings {
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  opacity?: number;
  font_size?: number;
  color?: string;
  background_color?: string;
  background_opacity?: number;
  padding?: number;
  angle?: number;
}

export interface FileProcessingJob {
  id: number;
  file_id: number;
  job_type: "watermark" | "thumbnail" | "compress" | "virus_scan";
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  error_message?: string;
  job_parameters?: Record<string, any>;
  result_data?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  duration?: number;
  human_duration: string;
  file?: InvoiceAttachment;
}

export interface FileUploadOptions {
  watermark_enabled: boolean;
  watermark_text?: string;
  watermark_position?: WatermarkSettings["position"];
  description?: string;
}

export interface FileProcessingStatus {
  attachment_id: number;
  overall_status: "pending" | "processing" | "completed" | "failed";
  jobs: Array<{
    type: string;
    status: string;
    attempts: number;
    error?: string;
    duration: string;
    created_at: string;
    completed_at?: string;
  }>;
}

export interface FileStatistics {
  total_files: number;
  total_size: number;
  total_size_formatted: string;
  watermarked_files: number;
  processing_jobs: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  file_types: Array<{
    mime_type: string;
    count: number;
  }>;
}

// API Response Types
export interface FileUploadResponse {
  success: boolean;
  attachment?: InvoiceAttachment;
  errors?: Record<string, string[]>;
  message?: string;
}

export interface WatermarkResponse {
  success: boolean;
  watermark?: FileWatermark;
  job_id?: number;
  message?: string;
}

// Constants
export const WATERMARK_POSITIONS = {
  TOP_LEFT: "top-left" as const,
  TOP_RIGHT: "top-right" as const,
  BOTTOM_LEFT: "bottom-left" as const,
  BOTTOM_RIGHT: "bottom-right" as const,
  CENTER: "center" as const,
} as const;
