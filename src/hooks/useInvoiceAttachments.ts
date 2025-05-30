import { useState, useEffect, useCallback, useRef } from "react";
import {
  InvoiceAttachment,
  AttachmentFormData,
  AttachmentUpdateData,
  AttachmentStats,
  UseInvoiceAttachmentsReturn,
} from "@/types/attachment";
import attachmentService from "@/services/attachmentService";

export const useInvoiceAttachments = (
  invoiceId: number
): UseInvoiceAttachmentsReturn => {
  const [attachments, setAttachments] = useState<InvoiceAttachment[]>([]);
  const [stats, setStats] = useState<AttachmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null);
    }
  }, []);

  // Safe state setter helper
  const safeSetState = useCallback((setter: () => void) => {
    if (isMountedRef.current) {
      setter();
    }
  }, []);

  // Fetch attachments from server
  const fetchAttachments = useCallback(async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await attachmentService.getAttachments(invoiceId);

      safeSetState(() => {
        setAttachments(response.data);
        setStats(response.stats);
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load attachments";
      safeSetState(() => setError(errorMessage));
    } finally {
      safeSetState(() => setLoading(false));
    }
  }, [invoiceId, safeSetState]);

  // Initial load
  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  // Upload new attachment
  const uploadAttachment = useCallback(
    async (formData: AttachmentFormData): Promise<InvoiceAttachment> => {
      if (!invoiceId) {
        throw new Error("Invoice ID is required");
      }

      setError(null);

      try {
        const response = await attachmentService.uploadAttachment(
          invoiceId,
          formData
          // Progress callback could be handled here if needed
        );

        const newAttachment = response.data;

        // Update local state
        safeSetState(() => {
          setAttachments((prev) => [...prev, newAttachment]);

          // Update stats
          if (stats) {
            const newStats: AttachmentStats = {
              total_files: stats.total_files + 1,
              total_size: stats.total_size + newAttachment.file_size,
              formatted_total_size: attachmentService.formatFileSize(
                stats.total_size + newAttachment.file_size
              ),
              file_types: {
                ...stats.file_types,
                [newAttachment.file_extension]:
                  (stats.file_types[newAttachment.file_extension] || 0) + 1,
              },
            };
            setStats(newStats);
          }
        });

        return newAttachment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload attachment";
        safeSetState(() => setError(errorMessage));
        throw err;
      }
    },
    [invoiceId, stats, safeSetState]
  );

  // Update attachment description
  const updateAttachment = useCallback(
    async (
      attachmentId: number,
      data: AttachmentUpdateData
    ): Promise<InvoiceAttachment> => {
      if (!invoiceId) {
        throw new Error("Invoice ID is required");
      }

      setError(null);

      try {
        const response = await attachmentService.updateAttachment(
          invoiceId,
          attachmentId,
          data
        );
        const updatedAttachment = response.data;

        // Update local state
        safeSetState(() => {
          setAttachments((prev) =>
            prev.map((attachment) =>
              attachment.id === attachmentId ? updatedAttachment : attachment
            )
          );
        });

        return updatedAttachment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update attachment";
        safeSetState(() => setError(errorMessage));
        throw err;
      }
    },
    [invoiceId, safeSetState]
  );

  // Delete attachment
  const deleteAttachment = useCallback(
    async (attachmentId: number): Promise<boolean> => {
      if (!invoiceId) {
        throw new Error("Invoice ID is required");
      }

      setError(null);

      try {
        await attachmentService.deleteAttachment(invoiceId, attachmentId);

        // Find the attachment to delete for stats update
        const attachmentToDelete = attachments.find(
          (a) => a.id === attachmentId
        );

        // Update local state
        safeSetState(() => {
          setAttachments((prev) =>
            prev.filter((attachment) => attachment.id !== attachmentId)
          );

          // Update stats
          if (stats && attachmentToDelete) {
            const newStats: AttachmentStats = {
              total_files: stats.total_files - 1,
              total_size: stats.total_size - attachmentToDelete.file_size,
              formatted_total_size: attachmentService.formatFileSize(
                stats.total_size - attachmentToDelete.file_size
              ),
              file_types: {
                ...stats.file_types,
                [attachmentToDelete.file_extension]: Math.max(
                  (stats.file_types[attachmentToDelete.file_extension] || 1) -
                    1,
                  0
                ),
              },
            };
            setStats(newStats);
          }
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete attachment";
        safeSetState(() => setError(errorMessage));
        throw err;
      }
    },
    [invoiceId, attachments, stats, safeSetState]
  );

  // Download attachment
  const downloadAttachment = useCallback(
    async (attachmentId: number, forceDownload = true): Promise<void> => {
      if (!invoiceId) {
        throw new Error("Invoice ID is required");
      }

      setError(null);

      try {
        const attachment = attachments.find((a) => a.id === attachmentId);
        await attachmentService.downloadAttachment(
          invoiceId,
          attachmentId,
          attachment?.file_name
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to download attachment";
        safeSetState(() => setError(errorMessage));
        throw err;
      }
    },
    [invoiceId, attachments, safeSetState]
  );

  // Search attachments
  const searchAttachments = useCallback(
    async (query: string): Promise<InvoiceAttachment[]> => {
      if (!invoiceId) {
        throw new Error("Invoice ID is required");
      }

      setError(null);

      try {
        const response = await attachmentService.searchAttachments(
          invoiceId,
          query
        );
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search attachments";
        safeSetState(() => setError(errorMessage));
        throw err;
      }
    },
    [invoiceId, safeSetState]
  );

  // Filter by type
  const filterByType = useCallback(
    async (type: "images" | "pdfs" | "all"): Promise<InvoiceAttachment[]> => {
      if (!invoiceId) {
        throw new Error("Invoice ID is required");
      }

      setError(null);

      try {
        const response = await attachmentService.filterAttachmentsByType(
          invoiceId,
          type
        );
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to filter attachments";
        safeSetState(() => setError(errorMessage));
        throw err;
      }
    },
    [invoiceId, safeSetState]
  );

  // Refresh attachments (refetch from server)
  const refreshAttachments = useCallback(async (): Promise<void> => {
    await fetchAttachments();
  }, [fetchAttachments]);

  return {
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
  };
};
