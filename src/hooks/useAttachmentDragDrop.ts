import { useState, useCallback, useRef } from "react";
import {
  AttachmentDragDropData,
  UseAttachmentDragDropReturn,
} from "@/types/attachment";
import attachmentService from "@/services/attachmentService";

export const useAttachmentDragDrop = (
  onFilesSelected: (files: File[]) => void,
  options?: {
    maxFiles?: number;
    accept?: string[];
    maxSize?: number;
    disabled?: boolean;
  }
): UseAttachmentDragDropReturn => {
  const [dragData, setDragData] = useState<AttachmentDragDropData>({
    files: [],
    isDragging: false,
    dragCounter: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const isDragActive = dragData.isDragging && dragData.dragCounter > 0;

  // Validate files before processing
  const validateFiles = useCallback(
    (files: FileList | File[]): { valid: File[]; errors: string[] } => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      const maxFiles = options?.maxFiles || 10;
      const maxSize = options?.maxSize || 10 * 1024 * 1024; // 10MB

      if (fileArray.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return { valid: [], errors };
      }

      fileArray.forEach((file, index) => {
        const validation = attachmentService.validateFile(file, {
          maxSize,
          allowedTypes: options?.accept,
        });

        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`File "${file.name}": ${validation.errors.join(", ")}`);
        }
      });

      return { valid: validFiles, errors };
    },
    [options]
  );

  // Handle drag enter
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (options?.disabled) return;

      setDragData((prev) => ({
        ...prev,
        dragCounter: prev.dragCounter + 1,
        isDragging: true,
      }));
    },
    [options?.disabled]
  );

  // Handle drag leave
  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (options?.disabled) return;

      setDragData((prev) => {
        const newCounter = prev.dragCounter - 1;
        return {
          ...prev,
          dragCounter: newCounter,
          isDragging: newCounter > 0,
        };
      });
    },
    [options?.disabled]
  );

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (options?.disabled) return;

      // Set drop effect
      e.dataTransfer.dropEffect = "copy";
    },
    [options?.disabled]
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (options?.disabled) return;

      setDragData({
        files: [],
        isDragging: false,
        dragCounter: 0,
      });

      const droppedFiles = e.dataTransfer.files;

      if (droppedFiles.length === 0) return;

      const { valid: validFiles, errors } = validateFiles(droppedFiles);

      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
        // You might want to show these errors to the user
      }

      if (validFiles.length > 0) {
        setDragData((prev) => ({ ...prev, files: validFiles }));
        onFilesSelected(validFiles);
      }
    },
    [options?.disabled, validateFiles, onFilesSelected]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (!files || files.length === 0) return;

      const { valid: validFiles, errors } = validateFiles(files);

      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
      }

      if (validFiles.length > 0) {
        setDragData((prev) => ({ ...prev, files: validFiles }));
        onFilesSelected(validFiles);
      }

      // Reset input value to allow selecting the same file again
      if (e.target) {
        e.target.value = "";
      }
    },
    [validateFiles, onFilesSelected]
  );

  // Get props for the root drop zone element
  const getRootProps = useCallback(
    () => ({
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onClick: () => {
        if (!options?.disabled && inputRef.current) {
          inputRef.current.click();
        }
      },
    }),
    [
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      options?.disabled,
    ]
  );

  // Get props for the hidden file input element
  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file" as const,
      multiple: (options?.maxFiles || 1) > 1,
      accept: options?.accept?.join(",") || ".pdf,.jpg,.jpeg,.png,.gif",
      onChange: handleInputChange,
      style: { display: "none" },
      disabled: options?.disabled,
    }),
    [options?.maxFiles, options?.accept, options?.disabled, handleInputChange]
  );

  return {
    dragData,
    isDragActive,
    getRootProps,
    getInputProps,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
};
