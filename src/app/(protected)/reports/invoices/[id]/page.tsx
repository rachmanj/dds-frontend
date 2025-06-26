'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, FileText, Paperclip, Clock, Building2, User, Calendar, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InvoiceReport } from '@/lib/api/reports';
import { useReports } from '@/hooks/useReports';

export default function InvoiceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { status } = useSession();
    const invoiceId = parseInt(params?.id as string);

    const {
        loading,
        error,
        isAuthenticated,
        clearError,
        fetchInvoiceDetails
    } = useReports();

    const [invoice, setInvoice] = useState<InvoiceReport | null>(null);

    const loadInvoiceDetails = useCallback(async () => {
        const response = await fetchInvoiceDetails(invoiceId);
        if (response && response.success) {
            setInvoice(response.data);
        }
    }, [fetchInvoiceDetails, invoiceId]);

    useEffect(() => {
        if (isAuthenticated && invoiceId) {
            loadInvoiceDetails();
        }
    }, [isAuthenticated, loadInvoiceDetails, invoiceId]);

    const formatCurrency = useCallback((amount: number, currency: string) => {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        try {
            return formatter.format(amount);
        } catch {
            return `${currency} ${amount.toLocaleString()}`;
        }
    }, []);

    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }, []);

    const formatDateTime = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-4 w-[80px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Authentication Required</h3>
                                <p className="text-muted-foreground">
                                    You need to be logged in to access the reports.
                                </p>
                            </div>
                            <Button onClick={() => router.push('/login')}>
                                Go to Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-[150px]" />
                                        <Skeleton className="h-4 w-[100px]" />
                                        <Skeleton className="h-4 w-[120px]" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[80px]" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            {error}
                            <Button variant="ghost" size="sm" onClick={clearError}>
                                Dismiss
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Invoice Not Found</h3>
                                <p className="text-muted-foreground">
                                    The requested invoice could not be found.
                                </p>
                            </div>
                            <Button onClick={() => router.back()}>
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        {error}
                        <Button variant="ghost" size="sm" onClick={clearError}>
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Invoices Report
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
                        <p className="text-muted-foreground mt-1">
                            Comprehensive view of invoice {invoice.invoice_number}
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge variant={
                            invoice.status === 'paid' ? 'default' :
                                invoice.status === 'approved' ? 'secondary' :
                                    invoice.status === 'pending' ? 'outline' :
                                        'destructive'
                        }>
                            {invoice.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Invoice Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Invoice Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Invoice Number</label>
                                    <p className="mt-1 text-sm">{invoice.invoice_number}</p>
                                </div>

                                {invoice.faktur_no && (
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground">Faktur Number</label>
                                        <p className="mt-1 text-sm">{invoice.faktur_no}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Invoice Date</label>
                                    <p className="mt-1 text-sm">{formatDate(invoice.invoice_date)}</p>
                                </div>

                                {invoice.receive_date && (
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground">Receive Date</label>
                                        <p className="mt-1 text-sm">{formatDate(invoice.receive_date)}</p>
                                    </div>
                                )}

                                {invoice.po_no && (
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground">PO Number</label>
                                        <p className="mt-1 text-sm">{invoice.po_no}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Amount</label>
                                    <p className="mt-1 text-lg font-semibold">
                                        {formatCurrency(invoice.amount, invoice.currency)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="outline">
                                        {invoice.type?.type_name || 'N/A'}
                                    </Badge>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Created By</label>
                                    <p className="mt-1 text-sm flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {invoice.creator.name}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Supplier Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Supplier Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Supplier Name</label>
                                <p className="mt-1 text-sm">{invoice.supplier.name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Documents */}
                    {invoice.additionalDocuments && invoice.additionalDocuments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Additional Documents ({invoice.additionalDocuments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {invoice.additionalDocuments.map((doc: any, index: number) => (
                                        <div key={index} className="border rounded-md p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {doc.document_number || `Document ${index + 1}`}
                                                    </p>
                                                    {doc.type && (
                                                        <p className="text-xs text-muted-foreground">{doc.type.name}</p>
                                                    )}
                                                </div>
                                                {doc.document_date && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(doc.document_date)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Attachments */}
                    {invoice.attachments && invoice.attachments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Paperclip className="h-5 w-5" />
                                    Attachments ({invoice.attachments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {invoice.attachments.map((attachment: any, index: number) => (
                                        <div key={index} className="border rounded-md p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {attachment.original_name || `Attachment ${index + 1}`}
                                                    </p>
                                                    {attachment.file_type && (
                                                        <p className="text-xs text-muted-foreground">{attachment.file_type}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {attachment.file_size && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {(attachment.file_size / 1024).toFixed(1)} KB
                                                        </p>
                                                    )}
                                                    {attachment.uploader && (
                                                        <p className="text-xs text-muted-foreground">
                                                            by {attachment.uploader.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Distribution History */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Distribution History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoice.distributions && invoice.distributions.length > 0 ? (
                                <div className="space-y-4">
                                    {invoice.distributions.map((distribution: any, index: number) => (
                                        <div key={index} className="border rounded-md p-4">
                                            <div className="mb-3">
                                                <p className="text-sm font-medium">
                                                    {distribution.distribution_number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {distribution.type?.name} Distribution
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">From:</span>
                                                    <span>
                                                        {distribution.originDepartment?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">To:</span>
                                                    <span>
                                                        {distribution.destinationDepartment?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <Badge variant={
                                                        distribution.status === 'completed' ? 'default' :
                                                            distribution.status === 'sent' ? 'secondary' :
                                                                'outline'
                                                    } className="text-xs">
                                                        {distribution.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Timeline */}
                                            {distribution.histories && distribution.histories.length > 0 && (
                                                <div className="mt-4 pt-3 border-t">
                                                    <p className="text-xs font-medium text-muted-foreground mb-2">Timeline:</p>
                                                    <div className="space-y-2">
                                                        {distribution.histories.map((history: any, historyIndex: number) => (
                                                            <div key={historyIndex} className="flex items-start space-x-2">
                                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs">{history.action}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatDateTime(history.created_at)}
                                                                    </p>
                                                                    {history.user && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            by {history.user.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">No distribution history</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 