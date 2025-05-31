'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, Building2, User, FileText, Receipt, AlertTriangle, CheckCircle } from 'lucide-react';
import { getDistributionDetails, DistributionReport } from '@/lib/api/reports';

export default function DistributionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const distributionId = parseInt(params.id as string);

    const [distribution, setDistribution] = useState<DistributionReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDistributionDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getDistributionDetails(distributionId);

                if (response.success) {
                    setDistribution(response.data);
                } else {
                    setError('Failed to fetch distribution details');
                }
            } catch (err) {
                setError('An error occurred while fetching distribution details');
                console.error('Error fetching distribution details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (distributionId) {
            fetchDistributionDetails();
        }
    }, [distributionId]);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-muted-foreground">Loading distribution details...</span>
                </div>
            </div>
        );
    }

    if (error || !distribution) {
        return (
            <div className="p-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Package className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-destructive">Error</h3>
                            <div className="mt-2 text-sm text-destructive/80">
                                {error || 'Distribution not found'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Distributions Report
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Distribution Details</h1>
                        <p className="text-muted-foreground mt-1">
                            Comprehensive view of distribution {distribution.distribution_number}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${distribution.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            distribution.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                distribution.status === 'received' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                    distribution.status === 'discrepancy' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                            {distribution.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Distribution Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Distribution Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Distribution Number</label>
                                <p className="mt-1 text-sm">{distribution.distribution_number}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Type</label>
                                <p className="mt-1 text-sm">
                                    {distribution.type.name} ({distribution.type.code})
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Created Date</label>
                                <p className="mt-1 text-sm">{formatDate(distribution.created_at)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Created By</label>
                                <p className="mt-1 text-sm flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    {distribution.creator.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Route Information */}
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Building2 className="h-5 w-5 mr-2" />
                            Distribution Route
                        </h2>

                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-sm font-medium">
                                    {distribution.origin_department?.name || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {distribution.origin_department?.location_code || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Origin</p>
                            </div>

                            <div className="flex-1 mx-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t-2 border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-background px-3 text-sm text-muted-foreground">
                                            {distribution.type.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm font-medium">
                                    {distribution.destination_department?.name || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {distribution.destination_department?.location_code || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Destination</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    {(distribution.timeline_summary || distribution.document_summary) && (
                        <div className="bg-card border rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Summary</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Timeline Summary */}
                                {distribution.timeline_summary && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Timeline Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Total Actions:</span>
                                                <span className="text-sm font-medium">
                                                    {distribution.timeline_summary.total_actions}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Current Status:</span>
                                                <span className="text-sm font-medium">
                                                    {distribution.timeline_summary.current_status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Complete:</span>
                                                <span className={`text-sm font-medium ${distribution.timeline_summary.is_complete ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                                                    }`}>
                                                    {distribution.timeline_summary.is_complete ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Discrepancies:</span>
                                                <span className={`text-sm font-medium ${distribution.timeline_summary.has_discrepancies ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                    {distribution.timeline_summary.has_discrepancies ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            {distribution.timeline_summary.last_action_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Last Action:</span>
                                                    <span className="text-sm font-medium">
                                                        {formatDateTime(distribution.timeline_summary.last_action_at)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Document Summary */}
                                {distribution.document_summary && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Document Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Total Documents:</span>
                                                <span className="text-sm font-medium">
                                                    {distribution.document_summary.total_documents}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Invoices:</span>
                                                <span className="text-sm font-medium">
                                                    {distribution.document_summary.total_invoices}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Additional Documents:</span>
                                                <span className="text-sm font-medium">
                                                    {distribution.document_summary.total_additional_documents}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attached Documents */}
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Attached Documents</h2>

                        {/* Invoices */}
                        {distribution.invoices && distribution.invoices.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium mb-3 flex items-center">
                                    <Receipt className="h-4 w-4 mr-2" />
                                    Invoices ({distribution.invoices.length})
                                </h3>
                                <div className="space-y-3">
                                    {distribution.invoices.map((invoice: any, index: number) => (
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
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                        invoice.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                        }`}>
                                                        {invoice.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Documents */}
                        {distribution.additionalDocuments && distribution.additionalDocuments.length > 0 && (
                            <div>
                                <h3 className="text-md font-medium mb-3 flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Additional Documents ({distribution.additionalDocuments.length})
                                </h3>
                                <div className="space-y-3">
                                    {distribution.additionalDocuments.map((doc: any, index: number) => (
                                        <div key={index} className="border rounded-md p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {doc.document_number}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(doc.document_date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm">{doc.type?.name}</p>
                                                    {doc.description && (
                                                        <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Documents */}
                        {(!distribution.invoices || distribution.invoices.length === 0) &&
                            (!distribution.additionalDocuments || distribution.additionalDocuments.length === 0) && (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">No documents attached</p>
                                </div>
                            )}
                    </div>
                </div>

                {/* Action History Timeline */}
                <div className="lg:col-span-1">
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Action History
                        </h2>

                        {distribution.histories && distribution.histories.length > 0 ? (
                            <div className="space-y-4">
                                {distribution.histories.map((history, index) => (
                                    <div key={index} className="relative">
                                        {/* Timeline line */}
                                        {index < distribution.histories!.length - 1 && (
                                            <div className="absolute left-4 top-8 w-0.5 h-full bg-border"></div>
                                        )}

                                        <div className="flex items-start space-x-3">
                                            {/* Timeline dot */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${history.action.toLowerCase().includes('discrepancy') ? 'bg-red-100 dark:bg-red-900/20' :
                                                history.action.toLowerCase().includes('complete') ? 'bg-green-100 dark:bg-green-900/20' :
                                                    history.action.toLowerCase().includes('receive') ? 'bg-purple-100 dark:bg-purple-900/20' :
                                                        'bg-blue-100 dark:bg-blue-900/20'
                                                }`}>
                                                {history.action.toLowerCase().includes('discrepancy') ? (
                                                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                ) : history.action.toLowerCase().includes('complete') ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-muted rounded-lg p-3">
                                                    <p className="text-sm font-medium">
                                                        {history.action}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDateTime(history.created_at)}
                                                    </p>
                                                    {history.user && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                                            <User className="h-3 w-3 mr-1" />
                                                            {history.user.name}
                                                        </p>
                                                    )}
                                                    {history.notes && (
                                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                                            "{history.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">No action history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 