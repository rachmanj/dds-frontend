import { useState, useCallback } from "react";
import { InvoiceAttachment, FileUploadOptions } from "@/types/fileManagement";
import fileManagementService from "@/services/fileManagementService";

/**
 * Hook for file upload with progress tracking
 */
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (
      invoiceId: number,
      file: File,
      options: FileUploadOptions
    ): Promise<InvoiceAttachment> => {
      setUploading(true);
      setError(null);

      try {
        // Validate file
        const validation = fileManagementService.validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const attachment = await fileManagementService.uploadFile(
          invoiceId,
          file,
          options
        );

        return attachment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return {
    uploadFile,
    uploading,
    error,
  };
};

/**
 * Hook for watermark management
 */
export const useWatermark = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyWatermark = useCallback(
    async (
      attachmentId: number,
      options = {},
      force = false
    ): Promise<number> => {
      setLoading(true);
      setError(null);

      try {
        const jobId = await fileManagementService.applyWatermark(
          attachmentId,
          options,
          force
        );
        return jobId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to apply watermark";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    applyWatermark,
    loading,
    error,
  };
};
