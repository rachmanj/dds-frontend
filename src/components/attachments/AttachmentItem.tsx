import React, { useState } from 'react';
import {
    FileText,
    Image,
    Download,
    Eye,
    Edit2,
    Trash2,
    Check,
    X,
    Calendar,
    User
} from 'lucide-react';
import { AttachmentItemProps } from '@/types/attachment';
import attachmentService from '@/services/attachmentService';

const AttachmentItem: React.FC<AttachmentItemProps> = ({
    attachment,
    isSelected = false,
    viewMode = 'list',
    onSelect,
    onView,
    onDownload,
    onEdit,
    onDelete,
    readOnly = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(attachment.description || '');
    const [isLoading, setIsLoading] = useState(false);

    // Get file icon based on type
    const getFileIcon = () => {
        if (attachment.is_image) {
            return <Image className="w-5 h-5 text-blue-500" />;
        } else if (attachment.is_pdf) {
            return <FileText className="w-5 h-5 text-red-500" />;
        }
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    // Handle edit save
    const handleSaveEdit = async () => {
        if (!onEdit) return;

        setIsLoading(true);
        try {
            await onEdit();
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving edit:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle edit cancel
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditDescription(attachment.description || '');
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Grid view layout
    if (viewMode === 'grid') {
        return (
            <div
                className={`
                    relative group bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200
                    ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'}
                    ${onSelect ? 'cursor-pointer' : ''}
                `}
                onClick={onSelect}
            >
                {/* Selection Checkbox (if selectable) */}
                {onSelect && (
                    <div className="absolute top-2 left-2">
                        <div
                            className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                                ${isSelected
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-gray-300 group-hover:border-gray-400'
                                }
                            `}
                        >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                )}

                {/* File Icon */}
                <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        {getFileIcon()}
                    </div>
                </div>

                {/* File Name */}
                <h3 className="text-sm font-medium text-gray-900 text-center truncate mb-2">
                    {attachment.file_name}
                </h3>

                {/* File Size */}
                <p className="text-xs text-gray-500 text-center mb-2">
                    {attachment.formatted_file_size}
                </p>

                {/* Description */}
                {attachment.description && (
                    <p className="text-xs text-gray-600 text-center truncate mb-3">
                        {attachment.description}
                    </p>
                )}

                {/* Actions */}
                {!readOnly && (
                    <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {attachment.is_image || attachment.is_pdf ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView?.();
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                title="Preview"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        ) : null}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload?.();
                            }}
                            className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // List view layout
    return (
        <div
            className={`
                flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-all duration-200
                ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'}
                ${onSelect ? 'cursor-pointer' : ''}
            `}
            onClick={onSelect}
        >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Selection Checkbox */}
                {onSelect && (
                    <div
                        className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300 hover:border-gray-400'
                            }
                        `}
                    >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                )}

                {/* File Icon */}
                <div className="flex-shrink-0">
                    {getFileIcon()}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {attachment.file_name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {attachment.file_extension.toUpperCase()}
                        </span>
                    </div>

                    {/* Description */}
                    {isEditing ? (
                        <div className="mt-2 flex items-center space-x-2">
                            <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Add description..."
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit();
                                }}
                                disabled={isLoading}
                                className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                                title="Save"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Cancel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 truncate mt-1">
                            {attachment.description || 'No description'}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(attachment.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{attachment.uploader.name}</span>
                        </div>
                        <span>{attachment.formatted_file_size}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!readOnly && !isEditing && (
                <div className="flex items-center space-x-1 ml-4">
                    {attachment.is_image || attachment.is_pdf ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onView?.();
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Preview"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    ) : null}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload?.();
                        }}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AttachmentItem; 