import {
  InvoiceAttachment,
  FileWatermark,
  FileProcessingJob,
  FileProcessingStatus,
  FileStatistics,
  FileUploadOptions,
  FileUploadResponse,
  WatermarkResponse,
  WatermarkSettings,
} from "@/types/fileManagement";

const API_BASE = "/api/file-management";

class FileManagementService {
  /**
   * Upload file with enhanced processing options
   */
  async uploadFile(
    invoiceId: number,
    file: File,
    options: FileUploadOptions,
    onProgress?: (progress: number) => void
  ): Promise<InvoiceAttachment> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("watermark_enabled", options.watermark_enabled.toString());

    if (options.watermark_text) {
      formData.append("watermark_text", options.watermark_text);
    }

    if (options.watermark_position) {
      formData.append("watermark_position", options.watermark_position);
    }

    if (options.description) {
      formData.append("description", options.description);
    }

    const response = await fetch(`${API_BASE}/invoices/${invoiceId}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const data: FileUploadResponse = await response.json();

    if (!data.success || !data.attachment) {
      throw new Error(data.message || "Upload failed");
    }

    return data.attachment;
  }

  /**
   * Get file processing status
   */
  async getProcessingStatus(
    attachmentId: number
  ): Promise<FileProcessingStatus> {
    const response = await fetch(
      `${API_BASE}/attachments/${attachmentId}/processing-status`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get processing status");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to get processing status");
    }

    return data.status;
  }

  /**
   * Apply watermark to existing file
   */
  async applyWatermark(
    attachmentId: number,
    options: Partial<WatermarkSettings> = {},
    force: boolean = false
  ): Promise<number> {
    const response = await fetch(
      `${API_BASE}/attachments/${attachmentId}/watermark`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          ...options,
          force,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to apply watermark");
    }

    const data: WatermarkResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to apply watermark");
    }

    return data.job_id!;
  }

  /**
   * Get file statistics
   */
  async getFileStatistics(): Promise<FileStatistics> {
    const response = await fetch(`${API_BASE}/statistics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get file statistics");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to get file statistics");
    }

    return data.statistics;
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    maxSizeMB: number = 10
  ): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    // Check file type
    const supportedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    if (!supportedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "File type not supported",
      };
    }

    return { valid: true };
  }

  /**
   * Get file icon based on mime type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) {
      return "🖼️";
    } else if (mimeType === "application/pdf") {
      return "📄";
    } else if (mimeType.includes("word")) {
      return "📝";
    } else if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      return "📊";
    } else {
      return "📎";
    }
  }

  /**
   * Check if file type supports watermarking
   */
  supportsWatermarking(mimeType: string): boolean {
    const supportedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];

    return supportedTypes.includes(mimeType);
  }
}

export const fileManagementService = new FileManagementService();
export default fileManagementService;
