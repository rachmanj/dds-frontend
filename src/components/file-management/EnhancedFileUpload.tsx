import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileManagement';
import { InvoiceAttachment, FileUploadOptions } from '@/types/fileManagement';
import fileManagementService from '@/services/fileManagementService';

interface EnhancedFileUploadProps {
    invoiceId: number;
    onUploadComplete: (attachment: InvoiceAttachment) => void;
    maxFileSize?: number; // in MB
    multiple?: boolean;
    className?: string;
}

interface FileWithStatus {
    file: File;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    attachment?: InvoiceAttachment;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
    invoiceId,
    onUploadComplete,
    maxFileSize = 10,
    multiple = true,
    className = '',
}) => {
    const { uploadFile, uploading } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFiles, setSelectedFiles] = useState<FileWithStatus[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadOptions, setUploadOptions] = useState<FileUploadOptions>({
        watermark_enabled: true,
        watermark_position: 'bottom-right',
        description: '',
    });

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles: FileWithStatus[] = Array.from(files).map(file => {
            const validation = fileManagementService.validateFile(file, maxFileSize);
            return {
                file,
                status: validation.valid ? 'pending' : 'error',
                error: validation.valid ? undefined : validation.error,
            };
        });

        setSelectedFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        const pendingFiles = selectedFiles.filter(f => f.status === 'pending');

        for (let i = 0; i < pendingFiles.length; i++) {
            const fileWithStatus = pendingFiles[i];
            const fileIndex = selectedFiles.findIndex(f => f.file === fileWithStatus.file);

            try {
                // Update status to uploading
                setSelectedFiles(prev => prev.map((f, idx) =>
                    idx === fileIndex ? { ...f, status: 'uploading' } : f
                ));

                const attachment = await uploadFile(invoiceId, fileWithStatus.file, uploadOptions);

                // Update status to completed
                setSelectedFiles(prev => prev.map((f, idx) =>
                    idx === fileIndex ? {
                        ...f,
                        status: 'completed',
                        attachment
                    } : f
                ));

                onUploadComplete(attachment);

            } catch (error) {
                // Update status to error
                setSelectedFiles(prev => prev.map((f, idx) =>
                    idx === fileIndex ? {
                        ...f,
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Upload failed'
                    } : f
                ));
            }
        }
    };

    const getFileIcon = (mimeType: string) => {
        return fileManagementService.getFileIcon(mimeType);
    };

    const getStatusIcon = (status: FileWithStatus['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'uploading':
                return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
            default:
                return <FileIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    const pendingCount = selectedFiles.filter(f => f.status === 'pending').length;
    const canUpload = pendingCount > 0 && !uploading;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Enhanced File Upload
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Options */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="watermark-enabled"
                            checked={uploadOptions.watermark_enabled}
                            onCheckedChange={(checked) =>
                                setUploadOptions(prev => ({ ...prev, watermark_enabled: !!checked }))
                            }
                        />
                        <Label htmlFor="watermark-enabled">Apply Security Watermark</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="File description..."
                            value={uploadOptions.description}
                            onChange={(e) =>
                                setUploadOptions(prev => ({ ...prev, description: e.target.value }))
                            }
                        />
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Maximum file size: {maxFileSize}MB
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        Select Files
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple={multiple}
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        accept="image/*,application/pdf"
                    />
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <Label>Selected Files ({selectedFiles.length})</Label>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {selectedFiles.map((fileWithStatus, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(fileWithStatus.status)}
                                        <div>
                                            <p className="font-medium text-sm">
                                                {getFileIcon(fileWithStatus.file.type)} {fileWithStatus.file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(fileWithStatus.file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            {fileWithStatus.error && (
                                                <p className="text-xs text-red-500 mt-1">{fileWithStatus.error}</p>
                                            )}
                                        </div>
                                    </div>

                                    {fileWithStatus.status !== 'uploading' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {canUpload && (
                    <Button
                        onClick={uploadFiles}
                        disabled={!canUpload}
                        className="w-full"
                    >
                        Upload {pendingCount} File{pendingCount !== 1 ? 's' : ''}
                    </Button>
                )}

                {/* Help Text */}
                <Alert>
                    <AlertDescription>
                        Supported file types: Images (JPEG, PNG, GIF) and PDF documents.
                        {uploadOptions.watermark_enabled && ' Security watermarks will be applied automatically.'}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}; 