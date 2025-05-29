'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    Send,
    Package,
    FileCheck,
    Clock,
    AlertCircle,
    Download,
    Eye,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Distribution,
    DistributionStatus,
    getStatusLabel,
    getStatusColor,
    getNextAction,
    DocumentVerification,
} from '@/types/distribution';
import { distributionService } from '@/lib/api/distribution';
import { TransmittalAdvicePreview } from './TransmittalAdvicePreview';

interface WorkflowActionsProps {
    distribution: Distribution;
    onUpdate: (updatedDistribution: Distribution) => void;
    currentUserId?: number;
    currentUserDepartmentId?: number;
}

interface EnhancedDocumentVerification {
    document_type: string;
    document_id: number;
    status: 'verified' | 'missing' | 'damaged';
    notes?: string;
}

interface DiscrepancyInfo {
    hasDiscrepancies: boolean;
    details: EnhancedDocumentVerification[];
    message?: string;
}

export function WorkflowActions({
    distribution,
    onUpdate,
    currentUserId,
    currentUserDepartmentId
}: WorkflowActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
    const [isTransmittalPreviewOpen, setIsTransmittalPreviewOpen] = useState(false);
    const [verificationMode, setVerificationMode] = useState<'sender' | 'receiver'>('sender');
    const [enhancedDocumentVerifications, setEnhancedDocumentVerifications] = useState<EnhancedDocumentVerification[]>([]);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [discrepancyInfo, setDiscrepancyInfo] = useState<DiscrepancyInfo | null>(null);
    const [showDiscrepancyConfirmation, setShowDiscrepancyConfirmation] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    // Check if current user can perform actions
    const canPerformSenderActions = currentUserDepartmentId === distribution.origin_department_id;
    const canPerformReceiverActions = currentUserDepartmentId === distribution.destination_department_id;

    // Initialize document verifications when dialog opens
    const initializeDocumentVerifications = () => {
        const initialVerifications: EnhancedDocumentVerification[] = distribution.documents?.map(doc => ({
            document_type: doc.document_type,
            document_id: doc.document_id,
            status: 'verified' as const,
            notes: ''
        })) || [];

        setEnhancedDocumentVerifications(initialVerifications);
        setVerificationNotes('');
        setDiscrepancyInfo(null);
        setShowDiscrepancyConfirmation(false);
        setSelectAll(false);
    };

    // Handle select all functionality
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (verificationMode === 'sender') {
            // For sender, just check/uncheck all
            setEnhancedDocumentVerifications(prev =>
                prev.map(v => ({ ...v, status: 'verified' as const }))
            );
        } else {
            // For receiver, set all to verified when selecting all
            setEnhancedDocumentVerifications(prev =>
                prev.map(v => ({ ...v, status: checked ? 'verified' as const : 'verified' as const }))
            );
        }
    };

    // Check if all documents are verified (for select all state)
    const allDocumentsVerified = enhancedDocumentVerifications.every(v => v.status === 'verified');

    // Update select all state when individual documents change
    useEffect(() => {
        setSelectAll(allDocumentsVerified);
    }, [allDocumentsVerified]);

    // Get available actions based on status
    const getAvailableActions = () => {
        const actions = [];

        switch (distribution.status) {
            case 'draft':
                if (canPerformSenderActions) {
                    actions.push({
                        key: 'verify_sender',
                        label: 'Verify & Send',
                        icon: CheckCircle,
                        variant: 'default' as const,
                        description: 'Verify documents and mark as ready to send'
                    });
                }
                break;

            case 'verified_by_sender':
                if (canPerformSenderActions) {
                    actions.push({
                        key: 'send',
                        label: 'Send Distribution',
                        icon: Send,
                        variant: 'default' as const,
                        description: 'Send the distribution to destination department'
                    });
                }
                break;

            case 'sent':
                if (canPerformReceiverActions) {
                    actions.push({
                        key: 'receive',
                        label: 'Mark as Received',
                        icon: Package,
                        variant: 'default' as const,
                        description: 'Confirm receipt of the distribution'
                    });
                }
                break;

            case 'received':
                if (canPerformReceiverActions) {
                    actions.push({
                        key: 'verify_receiver',
                        label: 'Verify Documents',
                        icon: FileCheck,
                        variant: 'default' as const,
                        description: 'Verify received documents'
                    });
                }
                break;

            case 'verified_by_receiver':
                if (canPerformReceiverActions) {
                    actions.push({
                        key: 'complete',
                        label: 'Complete Distribution',
                        icon: CheckCircle,
                        variant: 'default' as const,
                        description: 'Mark distribution as completed'
                    });
                }
                break;
        }

        return actions;
    };

    // Handle workflow actions
    const handleWorkflowAction = async (action: string) => {
        setIsLoading(true);
        try {
            let updatedDistribution: Distribution;

            switch (action) {
                case 'verify_sender':
                    setVerificationMode('sender');
                    initializeDocumentVerifications();
                    setIsVerificationDialogOpen(true);
                    setIsLoading(false);
                    return;

                case 'send':
                    updatedDistribution = await distributionService.send(distribution.id);
                    toast.success('Distribution sent successfully');
                    break;

                case 'receive':
                    updatedDistribution = await distributionService.receive(distribution.id);
                    toast.success('Distribution marked as received');
                    break;

                case 'verify_receiver':
                    setVerificationMode('receiver');
                    initializeDocumentVerifications();
                    setIsVerificationDialogOpen(true);
                    setIsLoading(false);
                    return;

                case 'complete':
                    updatedDistribution = await distributionService.complete(distribution.id);
                    toast.success('Distribution completed successfully');
                    break;

                default:
                    throw new Error(`Unknown action: ${action}`);
            }

            onUpdate(updatedDistribution);
        } catch (error: any) {
            console.error('Workflow action failed:', error);
            toast.error(error.message || 'Failed to perform action');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle document verification
    const handleDocumentVerification = async (forceComplete = false) => {
        setIsLoading(true);
        try {
            // Check for discrepancies before submitting
            const discrepancies = enhancedDocumentVerifications.filter(v => v.status !== 'verified');

            if (discrepancies.length > 0 && !forceComplete && verificationMode === 'receiver') {
                setDiscrepancyInfo({
                    hasDiscrepancies: true,
                    details: discrepancies,
                    message: `Found ${discrepancies.length} document(s) with discrepancies. Please review and confirm.`
                });
                setShowDiscrepancyConfirmation(true);
                setIsLoading(false);
                return;
            }

            let updatedDistribution: Distribution;

            if (verificationMode === 'sender') {
                updatedDistribution = await distributionService.verifySender(
                    distribution.id,
                    enhancedDocumentVerifications,
                    verificationNotes
                );
                toast.success('Documents verified by sender');
            } else {
                try {
                    updatedDistribution = await distributionService.verifyReceiver(
                        distribution.id,
                        enhancedDocumentVerifications,
                        verificationNotes,
                        forceComplete
                    );
                    toast.success('Documents verified by receiver');
                } catch (error: any) {
                    if (error.response?.status === 422 && error.response?.data?.requires_confirmation) {
                        setDiscrepancyInfo({
                            hasDiscrepancies: true,
                            details: error.response.data.discrepancy_details || discrepancies,
                            message: error.response.data.message || 'Discrepancies found that require confirmation'
                        });
                        setShowDiscrepancyConfirmation(true);
                        setIsLoading(false);
                        return;
                    }
                    throw error;
                }
            }

            onUpdate(updatedDistribution);
            setIsVerificationDialogOpen(false);
            setEnhancedDocumentVerifications([]);
            setVerificationNotes('');
            setDiscrepancyInfo(null);
            setShowDiscrepancyConfirmation(false);
        } catch (error: any) {
            console.error('Document verification failed:', error);
            toast.error(error.message || 'Failed to verify documents');
        } finally {
            setIsLoading(false);
        }
    };

    // Update document verification status
    const updateDocumentVerification = (docType: string, docId: number, status: 'verified' | 'missing' | 'damaged', notes: string = '') => {
        setEnhancedDocumentVerifications(prev =>
            prev.map(v =>
                v.document_type === docType && v.document_id === docId
                    ? { ...v, status, notes }
                    : v
            )
        );
    };

    // Get verification status display
    const getVerificationStatusIcon = (status: 'verified' | 'missing' | 'damaged') => {
        switch (status) {
            case 'verified':
                return <Check className="h-4 w-4 text-green-600" />;
            case 'missing':
                return <X className="h-4 w-4 text-red-600" />;
            case 'damaged':
                return <AlertTriangle className="h-4 w-4 text-orange-600" />;
        }
    };

    const getVerificationStatusColor = (status: 'verified' | 'missing' | 'damaged') => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'missing':
                return 'bg-red-100 text-red-800';
            case 'damaged':
                return 'bg-orange-100 text-orange-800';
        }
    };

    // Handle transmittal advice download
    const handleDownloadTransmittal = async () => {
        try {
            // TODO: Implement actual PDF download
            const transmittalData = await distributionService.getTransmittalAdvice(distribution.id);
            toast.success('Transmittal advice downloaded');
        } catch (error: any) {
            console.error('Failed to download transmittal:', error);
            toast.error(error.message || 'Failed to download transmittal advice');
        }
    };

    // Handle transmittal preview
    const handlePreviewTransmittal = async () => {
        setIsTransmittalPreviewOpen(true);
    };

    const availableActions = getAvailableActions();

    return (
        <div className="space-y-4">
            {/* Current Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Current Status</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(distribution.status)} variant="secondary">
                            {getStatusLabel(distribution.status)}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                            {distribution.status === 'completed' && distribution.receiver_verified_at && (
                                `Completed on ${new Date(distribution.receiver_verified_at).toLocaleDateString()}`
                            )}
                            {distribution.status === 'sent' && distribution.sent_at && (
                                `Sent on ${new Date(distribution.sent_at).toLocaleDateString()}`
                            )}
                            {distribution.status === 'received' && distribution.received_at && (
                                `Received on ${new Date(distribution.received_at).toLocaleDateString()}`
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Workflow Actions */}
            {availableActions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Actions</CardTitle>
                        <CardDescription>
                            Actions you can perform on this distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {availableActions.map((action) => (
                                <AlertDialog key={action.key}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant={action.variant}
                                            className="w-full justify-start"
                                            disabled={isLoading}
                                        >
                                            <action.icon className="mr-2 h-4 w-4" />
                                            {action.label}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{action.label}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {action.description}
                                                <br />
                                                Are you sure you want to proceed?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleWorkflowAction(action.key)}
                                            >
                                                Confirm
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Document Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Document Actions</CardTitle>
                    <CardDescription>
                        Download or preview distribution documents
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handlePreviewTransmittal}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Transmittal Advice
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleDownloadTransmittal}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Transmittal Advice
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transmittal Advice Preview */}
            <TransmittalAdvicePreview
                distributionId={distribution.id}
                isOpen={isTransmittalPreviewOpen}
                onClose={() => setIsTransmittalPreviewOpen(false)}
            />

            {/* Document Verification Dialog */}
            <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {verificationMode === 'sender' ? 'Verify Documents (Sender)' : 'Verify Documents (Receiver)'}
                        </DialogTitle>
                        <DialogDescription>
                            {verificationMode === 'sender'
                                ? 'Please verify each document before sending'
                                : 'Please verify the status of each document received'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Select All Option */}
                        <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                            <Checkbox
                                checked={selectAll}
                                onCheckedChange={handleSelectAll}
                            />
                            <Label className="font-medium">
                                {verificationMode === 'sender'
                                    ? 'Select all documents as verified'
                                    : 'Mark all documents as verified'
                                }
                            </Label>
                        </div>

                        {/* Document verification list */}
                        <div className="space-y-3">
                            {enhancedDocumentVerifications.map((verification, index) => {
                                const doc = distribution.documents?.find(d =>
                                    d.document_type === verification.document_type &&
                                    d.document_id === verification.document_id
                                );

                                return (
                                    <div key={`${verification.document_type}-${verification.document_id}`}
                                        className="p-4 border rounded-lg space-y-3">

                                        {verificationMode === 'sender' ? (
                                            // Simple checkbox interface for sender
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    checked={verification.status === 'verified'}
                                                    onCheckedChange={(checked) =>
                                                        updateDocumentVerification(
                                                            verification.document_type,
                                                            verification.document_id,
                                                            checked ? 'verified' : 'verified', // Always verified for sender
                                                            verification.notes || ''
                                                        )
                                                    }
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {doc?.document?.invoice_number || doc?.document?.document_number || 'Unknown Document'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {verification.document_type === 'invoice' ? 'Invoice' : 'Additional Document'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {verification.status === 'verified' && <Check className="h-4 w-4 text-green-600" />}
                                                </div>
                                            </div>
                                        ) : (
                                            // Enhanced interface for receiver
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {doc?.document?.invoice_number || doc?.document?.document_number || 'Unknown Document'}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {verification.document_type === 'invoice' ? 'Invoice' : 'Additional Document'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getVerificationStatusIcon(verification.status)}
                                                        <Badge className={getVerificationStatusColor(verification.status)} variant="secondary">
                                                            {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Status Selection - only for receiver */}
                                                <div className="space-y-2">
                                                    <Label>Document Status</Label>
                                                    <Select
                                                        value={verification.status}
                                                        onValueChange={(value: 'verified' | 'missing' | 'damaged') =>
                                                            updateDocumentVerification(
                                                                verification.document_type,
                                                                verification.document_id,
                                                                value,
                                                                verification.notes || ''
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="verified">✅ Verified - Document received correctly</SelectItem>
                                                            <SelectItem value="missing">❌ Missing - Document not found in envelope</SelectItem>
                                                            <SelectItem value="damaged">⚠️ Damaged - Document damaged or unreadable</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Notes - only for non-verified or receiver mode */}
                                                {verification.status !== 'verified' && (
                                                    <div className="space-y-2">
                                                        <Label>Notes {(verification.status === 'missing' || verification.status === 'damaged') && <span className="text-red-500">*</span>}</Label>
                                                        <Textarea
                                                            placeholder={
                                                                verification.status === 'missing'
                                                                    ? 'Describe where you looked, when noticed missing, etc.'
                                                                    : 'Describe the damage, extent, readability, etc.'
                                                            }
                                                            value={verification.notes || ''}
                                                            onChange={(e) =>
                                                                updateDocumentVerification(
                                                                    verification.document_type,
                                                                    verification.document_id,
                                                                    verification.status,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="min-h-[60px]"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Overall verification notes */}
                        <div className="space-y-2">
                            <Label>Overall Verification Notes (Optional)</Label>
                            <Textarea
                                placeholder="Add any general notes about this verification..."
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setIsVerificationDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleDocumentVerification(false)}
                                disabled={isLoading || (verificationMode === 'receiver' && enhancedDocumentVerifications.some(v =>
                                    v.status !== 'verified' && (!v.notes || v.notes.trim() === '')
                                ))}
                            >
                                {isLoading ? 'Processing...' : 'Verify Documents'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Discrepancy Confirmation Dialog */}
            <AlertDialog open={showDiscrepancyConfirmation} onOpenChange={setShowDiscrepancyConfirmation}>
                <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span>Discrepancies Found</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {discrepancyInfo?.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {discrepancyInfo?.details.map((detail, index) => {
                            const doc = distribution.documents?.find(d =>
                                d.document_type === detail.document_type &&
                                d.document_id === detail.document_id
                            );

                            return (
                                <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium">
                                            {doc?.document?.invoice_number || doc?.document?.document_number || 'Unknown Document'}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getVerificationStatusIcon(detail.status)}
                                            <Badge className={getVerificationStatusColor(detail.status)} variant="secondary">
                                                {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                    {detail.notes && (
                                        <div className="text-sm text-muted-foreground">
                                            <strong>Notes:</strong> {detail.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDiscrepancyConfirmation(false)}>
                            Go Back to Edit
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setShowDiscrepancyConfirmation(false);
                                handleDocumentVerification(true);
                            }}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            Proceed with Discrepancies
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Permission Notice */}
            {availableActions.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                                No actions available. You may not have permission or the distribution is in a final state.
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 