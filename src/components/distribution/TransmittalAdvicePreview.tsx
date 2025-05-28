'use client';

import React, { useState, useEffect } from 'react';
import { Download, Printer, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { TransmittalAdviceData } from '@/types/distribution';
import { distributionService } from '@/lib/api/distribution';

interface TransmittalAdvicePreviewProps {
    distributionId: number;
    isOpen: boolean;
    onClose: () => void;
}

export function TransmittalAdvicePreview({
    distributionId,
    isOpen,
    onClose
}: TransmittalAdvicePreviewProps) {
    const [transmittalData, setTransmittalData] = useState<TransmittalAdviceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load transmittal data when dialog opens
    useEffect(() => {
        if (isOpen && distributionId) {
            loadTransmittalData();
        }
    }, [isOpen, distributionId]);

    const loadTransmittalData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await distributionService.getTransmittalAdvicePreview(distributionId);
            setTransmittalData(data);
        } catch (error: any) {
            console.error('Failed to load transmittal data:', error);
            setError(error.message || 'Failed to load transmittal advice');
            toast.error('Failed to load transmittal advice');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            // TODO: Implement actual PDF download
            toast.success('Transmittal advice downloaded');
        } catch (error: any) {
            console.error('Failed to download transmittal:', error);
            toast.error(error.message || 'Failed to download transmittal advice');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency || 'IDR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <FileText className="mr-2 h-5 w-5" />
                            Transmittal Advice Preview
                        </span>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Preview and download the transmittal advice document
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading transmittal advice...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-destructive font-medium">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={loadTransmittalData}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : transmittalData ? (
                    <div className="space-y-6 print:space-y-4">
                        {/* Document Header */}
                        <div className="text-center border-b pb-4 print:pb-2">
                            <h1 className="text-2xl font-bold print:text-xl">TRANSMITTAL ADVICE</h1>
                            <h2 className="text-lg font-semibold print:text-base">SURAT PENGANTAR</h2>
                            <div className="mt-2">
                                <Badge variant="outline" className="text-sm">
                                    {transmittalData.distribution_number}
                                </Badge>
                            </div>
                        </div>

                        {/* Distribution Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                            <Card className="print:border-0 print:shadow-none">
                                <CardHeader className="pb-3 print:pb-2">
                                    <CardTitle className="text-lg print:text-base">From / Dari</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 print:space-y-1">
                                    <div>
                                        <p className="font-semibold">{transmittalData.origin_department.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {transmittalData.origin_department.location_code}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {transmittalData.origin_department.project}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="print:border-0 print:shadow-none">
                                <CardHeader className="pb-3 print:pb-2">
                                    <CardTitle className="text-lg print:text-base">To / Kepada</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 print:space-y-1">
                                    <div>
                                        <p className="font-semibold">{transmittalData.destination_department.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {transmittalData.destination_department.location_code}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {transmittalData.destination_department.project}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Distribution Details */}
                        <Card className="print:border-0 print:shadow-none">
                            <CardHeader className="pb-3 print:pb-2">
                                <CardTitle className="text-lg print:text-base">Distribution Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date</label>
                                        <p className="font-medium">{formatDate(transmittalData.distribution_date)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                                        <p className="font-medium">{transmittalData.distribution_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Created By</label>
                                        <p className="font-medium">{transmittalData.creator.name}</p>
                                        <p className="text-sm text-muted-foreground">{transmittalData.creator.department}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents List */}
                        <Card className="print:border-0 print:shadow-none">
                            <CardHeader className="pb-3 print:pb-2">
                                <CardTitle className="text-lg print:text-base">
                                    Documents Transmitted ({transmittalData.total_documents})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 print:space-y-2">
                                    {transmittalData.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg print:border-gray-300 print:p-2">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{doc.number}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {doc.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {doc.description}
                                                </p>
                                                {doc.date && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Date: {formatDate(doc.date)}
                                                    </p>
                                                )}
                                            </div>
                                            {doc.amount && doc.currency && (
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {formatCurrency(doc.amount, doc.currency)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {transmittalData.notes && (
                            <Card className="print:border-0 print:shadow-none">
                                <CardHeader className="pb-3 print:pb-2">
                                    <CardTitle className="text-lg print:text-base">Notes / Catatan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{transmittalData.notes}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Signature Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4 mt-8 print:mt-4">
                            <div className="text-center">
                                <p className="font-medium mb-16 print:mb-8">Sender / Pengirim</p>
                                <div className="border-t border-gray-300 pt-2">
                                    <p className="font-medium">{transmittalData.creator.name}</p>
                                    <p className="text-sm text-muted-foreground">{transmittalData.creator.department}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-medium mb-16 print:mb-8">Receiver / Penerima</p>
                                <div className="border-t border-gray-300 pt-2">
                                    <p className="text-sm text-muted-foreground">Name & Signature</p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="text-center mt-8 print:mt-4 print:break-inside-avoid">
                            <div className="inline-block p-4 border rounded-lg">
                                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                    <span className="text-xs text-gray-500">QR Code</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Scan for verification
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {transmittalData.qr_code_data}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-muted-foreground mt-8 print:mt-4 border-t pt-4 print:pt-2">
                            <p>This document is computer generated and does not require a signature.</p>
                            <p>Generated on {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
} 