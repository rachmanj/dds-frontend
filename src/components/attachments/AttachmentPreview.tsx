import React, { useState, useEffect } from 'react';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    AlertCircle
} from 'lucide-react';
import { AttachmentPreviewProps } from '@/types/attachment';

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
    attachment,
    isOpen,
    onClose,
    onNext,
    onPrevious,
    canNavigate = false,
}) => {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Handle zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleResetZoom = () => setZoom(100);

    // Handle rotation
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    // Handle fullscreen toggle
    const handleFullscreen = () => setIsFullscreen(!isFullscreen);

    // Handle download
    const handleDownload = () => {
        console.log('Download attachment:', attachment?.id);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (canNavigate && onPrevious) {
                        e.preventDefault();
                        onPrevious();
                    }
                    break;
                case 'ArrowRight':
                    if (canNavigate && onNext) {
                        e.preventDefault();
                        onNext();
                    }
                    break;
                case '=':
                case '+':
                    if (attachment?.is_image) {
                        e.preventDefault();
                        handleZoomIn();
                    }
                    break;
                case '-':
                    if (attachment?.is_image) {
                        e.preventDefault();
                        handleZoomOut();
                    }
                    break;
                case '0':
                    if (attachment?.is_image) {
                        e.preventDefault();
                        handleResetZoom();
                    }
                    break;
                case 'r':
                case 'R':
                    if (attachment?.is_image) {
                        e.preventDefault();
                        handleRotate();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, canNavigate, onNext, onPrevious, onClose, attachment?.is_image]);

    // Reset state when attachment changes
    useEffect(() => {
        if (attachment) {
            setZoom(100);
            setRotation(0);
            setIsLoading(true);
            setHasError(false);
        }
    }, [attachment?.id]);

    // Early return if not open or no attachment
    if (!isOpen || !attachment) {
        return null;
    }

    const renderContent = () => {
        if (hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <AlertCircle className="w-16 h-16 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Failed to load preview</h3>
                    <p className="text-sm text-center">
                        This file cannot be previewed. You can download it to view the content.
                    </p>
                    <button
                        onClick={handleDownload}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                    </button>
                </div>
            );
        }

        if (attachment.is_image) {
            return (
                <div className="flex items-center justify-center h-full">
                    <img
                        src={attachment.file_url}
                        alt={attachment.file_name}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                    />
                </div>
            );
        }

        if (attachment.is_pdf) {
            return (
                <div className="w-full h-full">
                    <iframe
                        src={attachment.file_url}
                        className="w-full h-full border-0"
                        title={attachment.file_name}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <AlertCircle className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                <p className="text-sm text-center">
                    This file type cannot be previewed in the browser.
                </p>
                <button
                    onClick={handleDownload}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                </button>
            </div>
        );
    };

    return (
        <div
            className={`
                fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center
                ${isFullscreen ? 'p-0' : 'p-4'}
            `}
            onClick={onClose}
        >
            {/* Main Content Container */}
            <div
                className={`
                    bg-white rounded-lg shadow-xl flex flex-col max-w-full max-h-full
                    ${isFullscreen ? 'w-full h-full rounded-none' : 'w-5/6 h-5/6'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-medium text-gray-900 truncate">
                            {attachment.file_name}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {attachment.formatted_file_size}
                        </span>
                    </div>

                    {/* Header Controls */}
                    <div className="flex items-center space-x-2">
                        {/* Navigation */}
                        {canNavigate && (
                            <>
                                <button
                                    onClick={onPrevious}
                                    disabled={!onPrevious}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Previous (←)"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onNext}
                                    disabled={!onNext}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Next (→)"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-2" />
                            </>
                        )}

                        {/* Zoom Controls (for images) */}
                        {attachment.is_image && (
                            <>
                                <button
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 25}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    title="Zoom Out (-)"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                                    {zoom}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 300}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    title="Zoom In (+)"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleRotate}
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                    title="Rotate (R)"
                                >
                                    <RotateCw className="w-4 h-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-2" />
                            </>
                        )}

                        {/* Download */}
                        <button
                            onClick={handleDownload}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={handleFullscreen}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Toggle Fullscreen"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Close (Esc)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden bg-gray-100">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    )}
                    {renderContent()}
                </div>

                {/* Footer with attachment info */}
                {attachment.description && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Description:</span> {attachment.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttachmentPreview; 