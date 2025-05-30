import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle, FileText, Image } from 'lucide-react';
import { AttachmentUploadProps, AttachmentFormData } from '@/types/attachment';
import { useAttachmentDragDrop } from '@/hooks/useAttachmentDragDrop';
import attachmentService from '@/services/attachmentService';

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
    invoiceId,
    onUploadSuccess,
    onUploadError,
    disabled = false,
    multiple = true,
    dragDropEnabled = true,
    showProgress = true,
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    // Handle file selection from drag-drop or file picker
    const handleFilesSelected = useCallback((files: File[]) => {
        setSelectedFiles(files);
        setErrors([]);
    }, []);

    const {
        isDragActive,
        getRootProps,
        getInputProps,
    } = useAttachmentDragDrop(handleFilesSelected, {
        maxFiles: multiple ? 10 : 1,
        disabled: disabled || uploading,
    });

    // Remove file from selection
    const removeFile = useCallback((index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Upload all selected files
    const uploadFiles = useCallback(async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setErrors([]);
        const newProgress: Record<string, number> = {};

        try {
            const uploadPromises = selectedFiles.map(async (file, index) => {
                const fileKey = `${file.name}-${index}`;
                newProgress[fileKey] = 0;
                setUploadProgress({ ...newProgress });

                const formData: AttachmentFormData = { file };

                try {
                    const response = await attachmentService.uploadAttachment(
                        invoiceId,
                        formData,
                        showProgress ? (progress) => {
                            setUploadProgress(prev => ({
                                ...prev,
                                [fileKey]: progress.percentage,
                            }));
                        } : undefined
                    );

                    onUploadSuccess?.(response.data);
                    return response.data;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                    setErrors(prev => [...prev, `${file.name}: ${errorMessage}`]);
                    onUploadError?.(errorMessage);
                    throw error;
                }
            });

            await Promise.allSettled(uploadPromises);

            // Clear successful uploads
            setSelectedFiles([]);
            setUploadProgress({});
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    }, [selectedFiles, invoiceId, onUploadSuccess, onUploadError, showProgress]);

    // Get file type icon
    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <Image className="w-5 h-5 text-blue-500" />;
        } else if (file.type === 'application/pdf') {
            return <FileText className="w-5 h-5 text-red-500" />;
        }
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        return attachmentService.formatFileSize(bytes);
    };

    // Get root props and handle click
    const rootProps = getRootProps();
    const handleClick = () => {
        if (!disabled && !uploading) {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            input?.click();
        }
    };

    return (
        <div className="space-y-4">
            {/* Drag and Drop Area */}
            {dragDropEnabled && (
                <div
                    {...rootProps}
                    className={`
                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                        ${isDragActive
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }
                        ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <input {...getInputProps()} />
                    <Upload className={`mx-auto h-8 w-8 mb-2 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-600">
                        {isDragActive ? (
                            'Drop files here...'
                        ) : (
                            <>
                                Drag and drop files here, or{' '}
                                <span className="text-blue-600 hover:text-blue-500">click to browse</span>
                            </>
                        )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, JPEG, PNG, GIF (max 10MB each)
                    </p>
                </div>
            )}

            {/* Traditional File Input (if drag-drop is disabled) */}
            {!dragDropEnabled && (
                <div>
                    <input {...getInputProps()} />
                    <button
                        type="button"
                        onClick={handleClick}
                        disabled={disabled || uploading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                    </button>
                </div>
            )}

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                    <div className="space-y-2">
                        {selectedFiles.map((file, index) => {
                            const fileKey = `${file.name}-${index}`;
                            const progress = uploadProgress[fileKey] || 0;

                            return (
                                <div key={fileKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3 flex-1">
                                        {getFileIcon(file)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {uploading && showProgress && progress > 0 && (
                                        <div className="w-24 mx-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 text-center">
                                                {progress}%
                                            </p>
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    {!uploading && (
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Upload Button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={uploadFiles}
                            disabled={uploading || selectedFiles.length === 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Upload Errors
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => setErrors([])}
                                    className="text-sm text-red-800 hover:text-red-900 underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentUpload; 