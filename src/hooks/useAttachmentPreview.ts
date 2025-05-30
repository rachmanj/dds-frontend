import { useState, useCallback, useEffect } from "react";
import {
  InvoiceAttachment,
  AttachmentPreviewData,
  UseAttachmentPreviewReturn,
} from "@/types/attachment";
import attachmentService from "@/services/attachmentService";

export const useAttachmentPreview = (
  attachments: InvoiceAttachment[] = [],
  invoiceId?: number
): UseAttachmentPreviewReturn => {
  const [previewData, setPreviewData] = useState<AttachmentPreviewData | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Find current attachment in the list
  const currentAttachment = previewData?.attachment;
  const currentAttachmentIndex = currentAttachment
    ? attachments.findIndex((a) => a.id === currentAttachment.id)
    : -1;

  // Navigation helpers
  const canNavigateNext =
    currentAttachmentIndex >= 0 &&
    currentAttachmentIndex < attachments.length - 1;
  const canNavigatePrevious = currentAttachmentIndex > 0;

  // Generate preview URL for attachment
  const generatePreviewUrl = useCallback(
    async (attachment: InvoiceAttachment): Promise<string | undefined> => {
      if (!invoiceId) return undefined;

      // Only generate preview URLs for images and PDFs
      if (attachmentService.canPreviewInline(attachment.mime_type)) {
        try {
          return await attachmentService.getAttachmentPreviewBlob(
            invoiceId,
            attachment.id
          );
        } catch (error) {
          console.error("Failed to get preview blob:", error);
          return undefined;
        }
      }

      return undefined;
    },
    [invoiceId]
  );

  // Open preview for specific attachment
  const openPreview = useCallback(
    async (attachment: InvoiceAttachment) => {
      // Clean up any existing blob URL first
      if (previewData?.previewUrl) {
        attachmentService.revokeBlobUrl(previewData.previewUrl);
      }

      const previewUrl = await generatePreviewUrl(attachment);

      setPreviewData({
        attachment,
        previewUrl,
        isLoading: false,
        error: undefined,
      });

      setCurrentIndex(attachments.findIndex((a) => a.id === attachment.id));
      setIsOpen(true);
    },
    [attachments, generatePreviewUrl, previewData?.previewUrl]
  );

  // Close preview
  const closePreview = useCallback(() => {
    // Clean up blob URL if it exists
    if (previewData?.previewUrl) {
      attachmentService.revokeBlobUrl(previewData.previewUrl);
    }

    setIsOpen(false);
    setPreviewData(null);
    setCurrentIndex(-1);
  }, [previewData?.previewUrl]);

  // Cleanup effect when component unmounts or previewData changes
  useEffect(() => {
    return () => {
      // Clean up any existing blob URL when component unmounts
      if (previewData?.previewUrl) {
        attachmentService.revokeBlobUrl(previewData.previewUrl);
      }
    };
  }, [previewData?.previewUrl]);

  // Navigate to next attachment
  const navigateNext = useCallback(() => {
    if (!canNavigateNext || currentAttachmentIndex < 0) return;

    const nextAttachment = attachments[currentAttachmentIndex + 1];
    if (nextAttachment) {
      openPreview(nextAttachment);
    }
  }, [canNavigateNext, currentAttachmentIndex, attachments, openPreview]);

  // Navigate to previous attachment
  const navigatePrevious = useCallback(() => {
    if (!canNavigatePrevious || currentAttachmentIndex < 0) return;

    const previousAttachment = attachments[currentAttachmentIndex - 1];
    if (previousAttachment) {
      openPreview(previousAttachment);
    }
  }, [canNavigatePrevious, currentAttachmentIndex, attachments, openPreview]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          closePreview();
          break;
        case "ArrowLeft":
          event.preventDefault();
          navigatePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          navigateNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePreview, navigateNext, navigatePrevious]);

  // Handle preview errors
  const handlePreviewError = useCallback((error: string) => {
    setPreviewData((prev) =>
      prev
        ? {
            ...prev,
            isLoading: false,
            error,
          }
        : null
    );
  }, []);

  // Handle preview loading state
  const handlePreviewLoading = useCallback((loading: boolean) => {
    setPreviewData((prev) =>
      prev
        ? {
            ...prev,
            isLoading: loading,
          }
        : null
    );
  }, []);

  // Update preview URL when attachment or invoiceId changes
  useEffect(() => {
    if (previewData?.attachment && invoiceId) {
      const updatePreviewUrl = async () => {
        const newPreviewUrl = await generatePreviewUrl(previewData.attachment);
        if (newPreviewUrl !== previewData.previewUrl) {
          // Clean up old blob URL if it exists
          if (previewData.previewUrl) {
            attachmentService.revokeBlobUrl(previewData.previewUrl);
          }

          setPreviewData((prev) =>
            prev
              ? {
                  ...prev,
                  previewUrl: newPreviewUrl,
                }
              : null
          );
        }
      };

      updatePreviewUrl();
    }
  }, [previewData?.attachment, invoiceId, generatePreviewUrl]);

  return {
    previewData,
    isOpen,
    openPreview,
    closePreview,
    navigateNext,
    navigatePrevious,
    canNavigateNext,
    canNavigatePrevious,
  };
};
