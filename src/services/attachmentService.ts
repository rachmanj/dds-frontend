import {
  InvoiceAttachment,
  AttachmentFormData,
  AttachmentUploadResponse,
  AttachmentListResponse,
  AttachmentResponse,
  AttachmentStatsResponse,
  AttachmentSearchResponse,
  AttachmentTypeFilterResponse,
  AttachmentUpdateData,
} from "@/types/attachment";
import { getSession } from "next-auth/react";

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000") + "/api";

class AttachmentService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const session = await getSession();
      return session?.accessToken || null;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  private async getHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  /**
   * Get all attachments for an invoice
   */
  async getAttachments(invoiceId: number): Promise<AttachmentListResponse> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    return this.handleResponse<AttachmentListResponse>(response);
  }

  /**
   * Upload a new attachment
   */
  async uploadAttachment(
    invoiceId: number,
    formData: AttachmentFormData,
    onProgress?: (progress: {
      loaded: number;
      total: number;
      percentage: number;
    }) => void
  ): Promise<AttachmentUploadResponse> {
    const token = await this.getAuthToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();

      form.append("file", formData.file);
      if (formData.description) {
        form.append("description", formData.description);
      }

      // Handle upload progress
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            reject(new Error("Invalid JSON response"));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(
              new Error(
                errorData.message || `Upload failed with status ${xhr.status}`
              )
            );
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload failed due to network error"));
      };

      xhr.onabort = () => {
        reject(new Error("Upload was aborted"));
      };

      // Open the request first
      xhr.open("POST", `${API_BASE}/invoices/${invoiceId}/attachments`);

      // Then set headers
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      // Finally send the request
      xhr.send(form);
    });
  }

  /**
   * Get attachment info without downloading the file
   */
  async getAttachmentInfo(
    invoiceId: number,
    attachmentId: number
  ): Promise<AttachmentResponse> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments/${attachmentId}/info`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    return this.handleResponse<AttachmentResponse>(response);
  }

  /**
   * Update attachment description
   */
  async updateAttachment(
    invoiceId: number,
    attachmentId: number,
    data: AttachmentUpdateData
  ): Promise<AttachmentResponse> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments/${attachmentId}`,
      {
        method: "PUT",
        headers: {
          ...(await this.getHeaders()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return this.handleResponse<AttachmentResponse>(response);
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(
    invoiceId: number,
    attachmentId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments/${attachmentId}`,
      {
        method: "DELETE",
        headers: await this.getHeaders(),
      }
    );

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Download an attachment (force download)
   */
  async downloadAttachment(
    invoiceId: number,
    attachmentId: number,
    fileName?: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments/${attachmentId}/download`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || `attachment_${attachmentId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get attachment file as blob URL for preview (inline viewing)
   * This method fetches the file with authentication headers and creates a blob URL
   */
  async getAttachmentPreviewBlob(
    invoiceId: number,
    attachmentId: number
  ): Promise<string> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments/${attachmentId}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch attachment: ${response.status}`);
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  /**
   * Search attachments by description
   */
  async searchAttachments(
    invoiceId: number,
    query: string
  ): Promise<AttachmentSearchResponse> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments/search?q=${encodeURIComponent(
        query
      )}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    return this.handleResponse<AttachmentSearchResponse>(response);
  }

  /**
   * Filter attachments by type
   */
  async filterAttachmentsByType(
    invoiceId: number,
    type: "images" | "pdfs" | "all"
  ): Promise<AttachmentTypeFilterResponse> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments/type/${type}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    return this.handleResponse<AttachmentTypeFilterResponse>(response);
  }

  /**
   * Get storage statistics for an invoice
   */
  async getAttachmentStats(
    invoiceId: number
  ): Promise<AttachmentStatsResponse> {
    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/attachments-stats`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    return this.handleResponse<AttachmentStatsResponse>(response);
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    config?: {
      maxSize?: number;
      allowedTypes?: string[];
      allowedExtensions?: string[];
    }
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = config?.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = config?.allowedTypes || [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    const allowedExtensions = config?.allowedExtensions || [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
    ];

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      errors.push(`File size must not exceed ${maxSizeMB} MB`);
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      errors.push("File must be a PDF or image (PDF, JPG, JPEG, PNG, GIF)");
    }

    // Check file extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push("Invalid file extension");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }

  /**
   * Get file type from MIME type
   */
  getFileType(mimeType: string): "pdf" | "image" | "unknown" {
    if (mimeType === "application/pdf") {
      return "pdf";
    } else if (mimeType.startsWith("image/")) {
      return "image";
    }
    return "unknown";
  }

  /**
   * Check if file can be previewed inline
   */
  canPreviewInline(mimeType: string): boolean {
    const previewableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    return previewableTypes.includes(mimeType);
  }

  /**
   * Get appropriate icon class for file type
   */
  getFileIcon(attachment: InvoiceAttachment): string {
    if (attachment.is_pdf) {
      return "file-pdf";
    } else if (attachment.is_image) {
      return "file-image";
    }
    return "file";
  }

  /**
   * Revoke blob URL to free memory
   */
  revokeBlobUrl(url: string): void {
    if (url.startsWith("blob:")) {
      window.URL.revokeObjectURL(url);
    }
  }
}

// Export singleton instance
export const attachmentService = new AttachmentService();
export default attachmentService;
