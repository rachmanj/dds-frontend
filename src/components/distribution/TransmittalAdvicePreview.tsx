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
            setLoading(true);
            const response = await fetch(`/api/distributions/${distributionId}/transmittal-advice/pdf`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/pdf',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transmittal-advice-${transmittalData?.distribution_number || distributionId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Transmittal advice downloaded successfully');
        } catch (error: any) {
            console.error('Failed to download transmittal:', error);
            toast.error(error.message || 'Failed to download transmittal advice');
        } finally {
            setLoading(false);
        }
    };

    const generatePrintContent = (data: TransmittalAdviceData) => {
        const formatDateShort = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        };

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Transmittal Advice - ${data.distribution_number}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        margin: 0;
                        padding: 20px;
                    }
                    .wrapper {
                        max-width: 210mm;
                        margin: 0 auto;
                    }
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .table td, .table th {
                        padding: 8px;
                        vertical-align: top;
                    }
                    .table-bordered {
                        border-collapse: collapse;
                    }
                    .table-bordered td, .table-bordered th {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .table-bordered th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    .row {
                        display: flex;
                        margin-bottom: 20px;
                    }
                    .col-5 {
                        flex: 0 0 41.666667%;
                        max-width: 41.666667%;
                        padding-right: 15px;
                    }
                    .col-6 {
                        flex: 0 0 50%;
                        max-width: 50%;
                        padding-left: 15px;
                    }
                    .col-12 {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .badge {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 3px;
                        font-size: 10px;
                        font-weight: bold;
                        color: white;
                        background-color: #28a745;
                    }
                    .badge-urgent {
                        background-color: #dc3545;
                    }
                    .badge-confidential {
                        background-color: #6f42c1;
                    }
                    h3, h4 {
                        margin: 5px 0;
                    }
                    p {
                        margin: 5px 0;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 15px;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <!-- Title row -->
                    <div class="row">
                        <div class="col-12">
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <td rowspan="2" style="width: 30%;">
                                            <h4>PT Arkananta Apta Pratista</h4>
                                        </td>
                                        <td rowspan="2" style="width: 50%; text-align: center;">
                                            <h3><strong>Transmittal Advice</strong></h3>
                                            <h4>Surat Pengantar Dokumen</h4>
                                            <h4>Nomor: ${data.distribution_number}</h4>
                                        </td>
                                        <td style="width: 20%; font-size: 12px;">ARKA/DDS/${new Date(data.distribution_date).getMonth() + 1}/${new Date(data.distribution_date).getFullYear()}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 12px;">${formatDateShort(data.distribution_date)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Info row -->
                    <div class="row">
                        <div class="col-5">
                            <p style="font-weight: bold;">Kepada</p>
                            <div style="margin-left: 20px;">
                                <p style="font-weight: bold;">${data.destination_department.name}</p>
                                <p style="font-weight: bold;">${data.destination_department.location_code}</p>
                                <p>${data.destination_department.project || ''}</p>
                            </div>
                        </div>
                        <div class="col-6">
                            <p><strong style="font-size: 14px;">Date: ${formatDateShort(data.distribution_date)}</strong></p>
                            <p>Type: <span class="badge ${data.distribution_type.toLowerCase() === 'urgent' ? 'badge-urgent' : data.distribution_type.toLowerCase() === 'confidential' ? 'badge-confidential' : ''}">${data.distribution_type}</span></p>
                            <p>From: ${data.origin_department.name} (${data.origin_department.location_code})</p>
                            <p>Created by: ${data.creator.name}</p>
                            ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
                        </div>
                    </div>

                    <!-- Table row -->
                    <div class="row">
                        <div class="col-12">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>NO</th>
                                        <th>DOCUMENT TYPE</th>
                                        <th>DOCUMENT NUMBER</th>
                                        <th>DATE</th>
                                        <th>DESCRIPTION</th>
                                        <th class="text-center">AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.documents.length > 0 ? data.documents.map((doc, index) => `
                                        <tr>
                                            <th>${index + 1}</th>
                                            <th>${doc.type}</th>
                                            <th>${doc.number}</th>
                                            <th>${doc.date ? formatDateShort(doc.date) : '-'}</th>
                                            <th>${doc.description}</th>
                                            <th class="text-right">
                                                ${doc.amount && doc.currency ?
                `${doc.currency} ${new Intl.NumberFormat('id-ID').format(doc.amount)}` :
                '-'
            }
                                            </th>
                                        </tr>
                                    `).join('') : `
                                        <tr>
                                            <td colspan="6" class="text-center" style="color: #666;">No documents attached</td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Summary row -->
                    <div class="row">
                        <div class="col-12">
                            <p><strong>Total Documents:</strong> ${data.total_documents}</p>
                        </div>
                    </div>

                    <!-- Signature row -->
                    <div class="row">
                        <div class="col-12">
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <th style="text-align: center; padding: 10px;">Sender</th>
                                        <th style="text-align: center; padding: 10px;">Acknowledge</th>
                                        <th style="text-align: center; padding: 10px;">Receiver</th>
                                    </tr>
                                    <tr>
                                        <td style="height: 40px;"></td>
                                        <td style="height: 40px;"></td>
                                        <td style="height: 40px;"></td>
                                    </tr>
                                    <tr>
                                        <td style="height: 40px;"></td>
                                        <td style="height: 40px;"></td>
                                        <td style="height: 40px;"></td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 5px;">(${data.creator.name})</td>
                                        <td style="text-align: center; padding: 5px;">(____________________________________)</td>
                                        <td style="text-align: center; padding: 5px;">(____________________________________)</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 5px;">${data.origin_department.name}</td>
                                        <td style="text-align: center; padding: 5px;"></td>
                                        <td style="text-align: center; padding: 5px;">${data.destination_department.name}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="row">
                        <div class="col-12 text-center" style="font-size: 10px; color: #666; margin-top: 20px;">
                            Generated on ${new Date().toLocaleString()}
                        </div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;
    };

    const handlePrint = () => {
        if (!transmittalData) {
            toast.error('No data available for printing');
            return;
        }

        const printContent = generatePrintContent(transmittalData);
        const printWindow = window.open('', '_blank');

        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
        } else {
            toast.error('Please allow popups to print the document');
        }
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

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={!transmittalData || loading}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                disabled={!transmittalData || loading}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {loading ? 'Downloading...' : 'Download PDF'}
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
                    <div className="space-y-6">
                        {/* Document Header */}
                        <div className="text-center border-b pb-4">
                            <h1 className="text-2xl font-bold">TRANSMITTAL ADVICE</h1>
                            <h2 className="text-lg font-semibold">SURAT PENGANTAR</h2>
                            <div className="mt-2">
                                <Badge variant="outline" className="text-sm">
                                    {transmittalData.distribution_number}
                                </Badge>
                            </div>
                        </div>

                        {/* Distribution Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">From / Dari</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
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

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">To / Kepada</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
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
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Distribution Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    Documents Transmitted ({transmittalData.total_documents})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {transmittalData.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
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
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Notes / Catatan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{transmittalData.notes}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Signature Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div className="text-center">
                                <p className="font-medium mb-16">Sender / Pengirim</p>
                                <div className="border-t border-gray-300 pt-2">
                                    <p className="font-medium">{transmittalData.creator.name}</p>
                                    <p className="text-sm text-muted-foreground">{transmittalData.creator.department}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-medium mb-16">Receiver / Penerima</p>
                                <div className="border-t border-gray-300 pt-2">
                                    <p className="text-sm text-muted-foreground">Name & Signature</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
} 