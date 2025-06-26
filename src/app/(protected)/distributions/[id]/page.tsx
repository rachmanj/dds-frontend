'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Edit, FileText, Receipt, Clock, User, Building2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { WorkflowActions } from '@/components/distribution/WorkflowActions';
import {
    Distribution,
    DistributionHistory,
    getStatusLabel,
    getStatusColor,
} from '@/types/distribution';
import { distributionService } from '@/lib/api/distribution';

export default function DistributionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { data: session, status } = useSession();
    const distributionId = parseInt(params?.id as string);

    const [distribution, setDistribution] = useState<Distribution | null>(null);
    const [history, setHistory] = useState<DistributionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check authentication
    const isAuthenticated = status === "authenticated" && !!session?.accessToken;

    // Get current user data from session
    const currentUser = session?.user ? {
        id: parseInt(session.user.id),
        department_id: (session.user as any).department_id, // Type assertion for department_id
    } : null;

    // Load distribution data
    useEffect(() => {
        const loadData = async () => {
            if (status === "loading") return; // Wait for session to load
            if (status === "unauthenticated") {
                setError("You must be logged in to view distributions");
                setLoading(false);
                return;
            }

            if (!session?.accessToken) {
                setError("No access token found. Please log in again.");
                setLoading(false);
                return;
            }

            if (!distributionId || isNaN(distributionId)) {
                setError('Invalid distribution ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Load distribution and history in parallel
                const [distributionData, historyData] = await Promise.all([
                    distributionService.getById(distributionId),
                    distributionService.getHistory(distributionId)
                ]);

                setDistribution(distributionData);
                setHistory(historyData);
            } catch (error: any) {
                console.error('Failed to load distribution:', error);
                if (error.response?.status === 401) {
                    setError("Authentication required. Please refresh the page and try again.");
                } else if (error.response?.status === 404) {
                    setError("Distribution not found");
                } else {
                    setError(error.message || 'Failed to load distribution data');
                }
                toast.error('Failed to load distribution data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [distributionId, status, session?.accessToken]);

    // Handle distribution update from workflow actions
    const handleDistributionUpdate = (updatedDistribution: Distribution) => {
        setDistribution(updatedDistribution);
        // Reload history to get the latest changes
        distributionService.getHistory(distributionId)
            .then(setHistory)
            .catch(console.error);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency || 'IDR'
        }).format(amount);
    };

    // Show loading state while checking authentication
    if (status === "loading" || loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-[300px]" />
                            <Skeleton className="h-4 w-[400px]" />
                            <div className="space-y-3 mt-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold">Authentication Required</h3>
                                <p className="text-muted-foreground">
                                    You need to be logged in to view distribution details.
                                </p>
                                {error && (
                                    <p className="text-sm text-red-600 mt-2">{error}</p>
                                )}
                            </div>
                            <Button onClick={() => window.location.href = '/login'}>
                                Go to Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !distribution) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-destructive font-medium">
                                    {error || 'Distribution not found'}
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => router.push('/distributions')}
                                >
                                    Go Back to Distributions
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/distributions')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Distributions
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {distribution.distribution_number}
                        </h1>
                        <p className="text-muted-foreground">
                            Distribution details and workflow management
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {distribution.status === 'draft' && (
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/distributions/${distributionId}/edit`)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Distribution Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribution Information</CardTitle>
                            <CardDescription>
                                Basic details about this distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Distribution Number
                                    </label>
                                    <p className="font-medium">{distribution.distribution_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <Badge className={getStatusColor(distribution.status)}>
                                            {getStatusLabel(distribution.status)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Type
                                    </label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {distribution.type && (
                                            <>
                                                <div
                                                    className="w-3 h-3 rounded"
                                                    style={{ backgroundColor: distribution.type.color }}
                                                />
                                                <span className="font-medium">{distribution.type.name}</span>
                                                <Badge variant="outline">{distribution.type.code}</Badge>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Created
                                    </label>
                                    <p className="font-medium">{formatDate(distribution.created_at)}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center">
                                        <Building2 className="mr-1 h-4 w-4" />
                                        From Department
                                    </label>
                                    <div className="mt-1">
                                        <p className="font-medium">{distribution.origin_department?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {distribution.origin_department?.location_code} - {distribution.origin_department?.project}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center">
                                        <Building2 className="mr-1 h-4 w-4" />
                                        To Department
                                    </label>
                                    <div className="mt-1">
                                        <p className="font-medium">{distribution.destination_department?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {distribution.destination_department?.location_code} - {distribution.destination_department?.project}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {distribution.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Notes
                                        </label>
                                        <p className="mt-1 text-sm">{distribution.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents ({(distribution.invoices?.length || 0) + (distribution.additional_documents?.length || 0)})</CardTitle>
                            <CardDescription>
                                Documents included in this distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(!distribution.invoices?.length && !distribution.additional_documents?.length) ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No documents attached to this distribution
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Invoices */}
                                    {distribution.invoices?.map((invoice) => (
                                        <div key={`invoice-${invoice.id}`} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Receipt className="h-5 w-5 text-blue-500" />
                                            <div className="flex-1">
                                                <div className="font-medium">{invoice.invoice_number}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Invoice - {invoice.supplier?.name}
                                                    {invoice.amount && invoice.currency && (
                                                        <span className="ml-2">
                                                            {formatCurrency(invoice.amount, invoice.currency)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Document verification status */}
                                            <div className="flex space-x-2">
                                                {distribution.documents?.find(
                                                    doc => doc.document_type === 'invoice' && doc.document_id === invoice.id
                                                )?.sender_verified && (
                                                        <Badge variant="secondary" className="text-xs">Sender ✓</Badge>
                                                    )}
                                                {distribution.documents?.find(
                                                    doc => doc.document_type === 'invoice' && doc.document_id === invoice.id
                                                )?.receiver_verified && (
                                                        <Badge variant="secondary" className="text-xs">Receiver ✓</Badge>
                                                    )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Additional Documents */}
                                    {distribution.additional_documents?.map((doc) => (
                                        <div key={`doc-${doc.id}`} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <FileText className="h-5 w-5 text-green-500" />
                                            <div className="flex-1">
                                                <div className="font-medium">{doc.document_number}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {doc.type?.type_name} - {doc.remarks}
                                                </div>
                                            </div>
                                            {/* Document verification status */}
                                            <div className="flex space-x-2">
                                                {distribution.documents?.find(
                                                    docRef => docRef.document_type === 'additional_document' && docRef.document_id === doc.id
                                                )?.sender_verified && (
                                                        <Badge variant="secondary" className="text-xs">Sender ✓</Badge>
                                                    )}
                                                {distribution.documents?.find(
                                                    docRef => docRef.document_type === 'additional_document' && docRef.document_id === doc.id
                                                )?.receiver_verified && (
                                                        <Badge variant="secondary" className="text-xs">Receiver ✓</Badge>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="mr-2 h-5 w-5" />
                                History Timeline
                            </CardTitle>
                            <CardDescription>
                                Track of all actions performed on this distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No history available
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((entry, index) => (
                                        <div key={entry.id} className="flex space-x-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 bg-primary rounded-full" />
                                                {index < history.length - 1 && (
                                                    <div className="w-px h-8 bg-border mt-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{entry.action}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(entry.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {entry.description}
                                                </p>
                                                {entry.user && (
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {entry.user.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Workflow Actions */}
                    <WorkflowActions
                        distribution={distribution}
                        onUpdate={handleDistributionUpdate}
                        currentUserId={currentUser?.id}
                        currentUserDepartmentId={currentUser?.department_id}
                    />

                    {/* Quick Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Created By
                                </label>
                                <p className="text-sm">{distribution.creator?.name || 'Unknown'}</p>
                            </div>
                            {distribution.sender_verifier && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Verified by Sender
                                    </label>
                                    <p className="text-sm">{distribution.sender_verifier.name}</p>
                                    {distribution.sender_verified_at && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(distribution.sender_verified_at)}
                                        </p>
                                    )}
                                </div>
                            )}
                            {distribution.receiver_verifier && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Verified by Receiver
                                    </label>
                                    <p className="text-sm">{distribution.receiver_verifier.name}</p>
                                    {distribution.receiver_verified_at && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(distribution.receiver_verified_at)}
                                        </p>
                                    )}
                                </div>
                            )}
                            {distribution.sent_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Sent At
                                    </label>
                                    <p className="text-sm">{formatDate(distribution.sent_at)}</p>
                                </div>
                            )}
                            {distribution.received_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Received At
                                    </label>
                                    <p className="text-sm">{formatDate(distribution.received_at)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 