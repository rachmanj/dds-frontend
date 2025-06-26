'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, FileText, Paperclip, Clock, Building2, User, Receipt, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdditionalDocumentReport } from '@/lib/api/reports';
import { useReports } from '@/hooks/useReports';

export default function AdditionalDocumentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { status } = useSession();
    const documentId = parseInt(params?.id as string);

    const {
        loading,
        error,
        isAuthenticated,
        clearError,
        fetchAdditionalDocumentDetails
    } = useReports();

    const [document, setDocument] = useState<AdditionalDocumentReport | null>(null);

    const loadDocumentDetails = useCallback(async () => {
        const response = await fetchAdditionalDocumentDetails(documentId);
        if (response && response.success) {
            setDocument(response.data);
        }
    }, [fetchAdditionalDocumentDetails, documentId]);

    useEffect(() => {
        if (isAuthenticated && documentId) {
            loadDocumentDetails();
        }
    }, [isAuthenticated, loadDocumentDetails, documentId]);

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

    if (error || !document) {
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
                                <h3 className="text-lg font-semibold">Document Not Found</h3>
                                <p className="text-muted-foreground">
                                    The requested document could not be found.
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
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Additional Documents Report
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Document Details</h1>
                        <p className="text-muted-foreground mt-1">
                            Comprehensive view of document {document.document_number}
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline">
                            {document.type.type_name}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Document Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Document Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Document Number</label>
                                    <p className="mt-1 text-sm">{document.document_number}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Document Date</label>
                                    <p className="mt-1 text-sm">{formatDate(document.document_date)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Type</label>
                                    <p className="mt-1 text-sm">{document.type.type_name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Created By</label>
                                    <p className="mt-1 text-sm flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {document.creator.name}
                                    </p>
                                </div>

                                {document.description && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-muted-foreground">Description</label>
                                        <p className="mt-1 text-sm">{document.description}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parent Invoices */}
                    {document.invoices && document.invoices.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    Parent Invoices ({document.invoices.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {document.invoices.map((invoice: any, index: number) => (
                                        <div key={index} className="border rounded-md p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {invoice.invoice_number}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(invoice.invoice_date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm">{invoice.supplier?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{invoice.type?.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(invoice.amount, invoice.currency)}
                                                    </p>
                                                    <Badge variant={
                                                        invoice.status === 'paid' ? 'default' :
                                                            invoice.status === 'approved' ? 'secondary' :
                                                                invoice.status === 'pending' ? 'outline' :
                                                                    'destructive'
                                                    }>
                                                        {invoice.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Invoice Attachments */}
                                            {invoice.attachments && invoice.attachments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                                        Attachments ({invoice.attachments.length}):
                                                    </p>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {invoice.attachments.map((attachment: any, attachIndex: number) => (
                                                            <div key={attachIndex} className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                                                                <div className="flex items-center">
                                                                    <Paperclip className="h-3 w-3 mr-1" />
                                                                    <span className="truncate">
                                                                        {attachment.original_name || `File ${attachIndex + 1}`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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
                            {document.distributions && document.distributions.length > 0 ? (
                                <div className="space-y-4">
                                    {document.distributions.map((distribution: any, index: number) => (
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
                                                    }>
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