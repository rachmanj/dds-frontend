import React, { useState, useCallback } from 'react';
import {
    Upload,
    Grid,
    List,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    HardDrive,
    Download,
    Trash2
} from 'lucide-react';
import { AttachmentListProps, InvoiceAttachment, AttachmentFilterType } from '@/types/attachment';
import { useInvoiceAttachments } from '@/hooks/useInvoiceAttachments';
import { useAttachmentPreview } from '@/hooks/useAttachmentPreview';
import AttachmentUpload from './AttachmentUpload';
import AttachmentItem from './AttachmentItem';
import AttachmentPreview from './AttachmentPreview';

const InvoiceAttachments: React.FC<AttachmentListProps> = ({
    invoiceId,
    invoiceNumber,
    readOnly = false,
    maxHeight = '600px',
    showStats = true,
    allowMultipleSelection = false,
    onAttachmentSelect,
    onAttachmentsChange,
}) => {
    // State management
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<AttachmentFilterType>('all');
    const [selectedAttachments, setSelectedAttachments] = useState<Set<number>>(new Set());
    const [showUpload, setShowUpload] = useState(false);

    // Custom hooks
    const {
        attachments,
        stats,
        loading,
        error,
        uploadAttachment,
        updateAttachment,
        deleteAttachment,
        downloadAttachment,
        refreshAttachments,
        clearError,
    } = useInvoiceAttachments(invoiceId);

    const {
        previewData,
        isOpen: isPreviewOpen,
        openPreview,
        closePreview,
        navigateNext,
        navigatePrevious,
        canNavigateNext,
        canNavigatePrevious,
    } = useAttachmentPreview(attachments, invoiceId);

    // Filter attachments based on search and type
    const filteredAttachments = attachments.filter(attachment => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                attachment.file_name.toLowerCase().includes(query) ||
                (attachment.description && attachment.description.toLowerCase().includes(query));
            if (!matchesSearch) return false;
        }

        // Type filter
        if (filterType === 'images' && !attachment.is_image) return false;
        if (filterType === 'pdfs' && !attachment.is_pdf) return false;

        return true;
    });

    // Handle attachment selection
    const handleAttachmentSelect = useCallback((attachment: InvoiceAttachment) => {
        if (!allowMultipleSelection) {
            onAttachmentSelect?.(attachment);
            return;
        }

        setSelectedAttachments(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(attachment.id)) {
                newSelected.delete(attachment.id);
            } else {
                newSelected.add(attachment.id);
            }
            return newSelected;
        });
    }, [allowMultipleSelection, onAttachmentSelect]);

    // Handle upload success
    const handleUploadSuccess = useCallback((attachment: InvoiceAttachment) => {
        onAttachmentsChange?.(attachments);
        // Optionally close upload panel after successful upload
        // setShowUpload(false);
    }, [attachments, onAttachmentsChange]);

    // Handle upload error
    const handleUploadError = useCallback((error: string) => {
        console.error('Upload error:', error);
    }, []);

    // Handle attachment edit
    const handleAttachmentEdit = useCallback(async (attachment: InvoiceAttachment, description: string) => {
        try {
            await updateAttachment(attachment.id, { description });
            onAttachmentsChange?.(attachments);
        } catch (error) {
            console.error('Failed to update attachment:', error);
        }
    }, [updateAttachment, attachments, onAttachmentsChange]);

    // Handle attachment delete
    const handleAttachmentDelete = useCallback(async (attachment: InvoiceAttachment) => {
        if (!confirm(`Are you sure you want to delete "${attachment.file_name}"?`)) {
            return;
        }

        try {
            await deleteAttachment(attachment.id);
            onAttachmentsChange?.(attachments);
        } catch (error) {
            console.error('Failed to delete attachment:', error);
        }
    }, [deleteAttachment, attachments, onAttachmentsChange]);

    // Handle attachment download
    const handleAttachmentDownload = useCallback(async (attachment: InvoiceAttachment) => {
        try {
            await downloadAttachment(attachment.id);
        } catch (error) {
            console.error('Failed to download attachment:', error);
        }
    }, [downloadAttachment]);

    // Handle bulk actions
    const handleSelectAll = () => {
        if (selectedAttachments.size === filteredAttachments.length) {
            setSelectedAttachments(new Set());
        } else {
            setSelectedAttachments(new Set(filteredAttachments.map(a => a.id)));
        }
    };

    const handleBulkDownload = async () => {
        const selectedItems = attachments.filter(a => selectedAttachments.has(a.id));
        for (const attachment of selectedItems) {
            await handleAttachmentDownload(attachment);
        }
    };

    const handleBulkDelete = async () => {
        const selectedItems = attachments.filter(a => selectedAttachments.has(a.id));
        if (!confirm(`Are you sure you want to delete ${selectedItems.length} selected file(s)?`)) {
            return;
        }

        for (const attachment of selectedItems) {
            await handleAttachmentDelete(attachment);
        }
        setSelectedAttachments(new Set());
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Attachments for Invoice {invoiceNumber}
                    </h3>
                    {showStats && stats && (
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.total_files} file{stats.total_files !== 1 ? 's' : ''} • {stats.formatted_total_size}
                        </p>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {!readOnly && (
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Files
                        </button>
                    )}

                    <button
                        onClick={refreshAttachments}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Upload Section */}
            {showUpload && !readOnly && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <AttachmentUpload
                        invoiceId={invoiceId}
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                        multiple={true}
                        dragDropEnabled={true}
                        showProgress={true}
                    />
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between space-x-4">
                {/* Search and Filter */}
                <div className="flex items-center space-x-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as AttachmentFilterType)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Files</option>
                        <option value="images">Images Only</option>
                        <option value="pdfs">PDFs Only</option>
                    </select>
                </div>

                {/* View Mode and Bulk Actions */}
                <div className="flex items-center space-x-2">
                    {allowMultipleSelection && selectedAttachments.size > 0 && (
                        <>
                            <span className="text-sm text-gray-600">
                                {selectedAttachments.size} selected
                            </span>
                            <button
                                onClick={handleBulkDownload}
                                className="p-2 text-gray-400 hover:text-green-600"
                                title="Download Selected"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            {!readOnly && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="p-2 text-gray-400 hover:text-red-600"
                                    title="Delete Selected"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <div className="w-px h-6 bg-gray-300" />
                        </>
                    )}

                    {allowMultipleSelection && filteredAttachments.length > 0 && (
                        <button
                            onClick={handleSelectAll}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            {selectedAttachments.size === filteredAttachments.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}

                    <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                            <button
                                onClick={clearError}
                                className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attachments List */}
            <div
                className="space-y-2 overflow-auto"
                style={{ maxHeight }}
            >
                {loading && attachments.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : filteredAttachments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <HardDrive className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No attachments found</p>
                        <p className="text-sm">
                            {searchQuery || filterType !== 'all'
                                ? 'Try adjusting your search or filter.'
                                : 'Upload files to get started.'
                            }
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredAttachments.map(attachment => (
                            <AttachmentItem
                                key={attachment.id}
                                attachment={attachment}
                                isSelected={selectedAttachments.has(attachment.id)}
                                viewMode="grid"
                                onSelect={allowMultipleSelection ? () => handleAttachmentSelect(attachment) : undefined}
                                onView={async () => await openPreview(attachment)}
                                onDownload={() => handleAttachmentDownload(attachment)}
                                onEdit={() => handleAttachmentEdit(attachment, attachment.description || '')}
                                onDelete={() => handleAttachmentDelete(attachment)}
                                readOnly={readOnly}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredAttachments.map(attachment => (
                            <AttachmentItem
                                key={attachment.id}
                                attachment={attachment}
                                isSelected={selectedAttachments.has(attachment.id)}
                                viewMode="list"
                                onSelect={allowMultipleSelection ? () => handleAttachmentSelect(attachment) : undefined}
                                onView={async () => await openPreview(attachment)}
                                onDownload={() => handleAttachmentDownload(attachment)}
                                onEdit={() => handleAttachmentEdit(attachment, attachment.description || '')}
                                onDelete={() => handleAttachmentDelete(attachment)}
                                readOnly={readOnly}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Storage Stats */}
            {showStats && stats && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                        <span>Storage used: {stats.formatted_total_size}</span>
                        <div className="flex items-center space-x-4">
                            {Object.entries(stats.file_types).map(([type, count]) => (
                                <span key={type} className="capitalize">
                                    {count} {type.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            <AttachmentPreview
                attachment={previewData?.attachment || null}
                isOpen={isPreviewOpen}
                onClose={closePreview}
                onNext={canNavigateNext ? navigateNext : undefined}
                onPrevious={canNavigatePrevious ? navigatePrevious : undefined}
                canNavigate={attachments.length > 1}
            />
        </div>
    );
};

export default InvoiceAttachments; 