'use client';

import React, { useState } from 'react';
import {
    CheckCircle,
    Send,
    Package,
    FileCheck,
    Clock,
    AlertCircle,
    Download,
    Eye
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
    const [documentVerifications, setDocumentVerifications] = useState<DocumentVerification[]>([]);

    // Check if current user can perform actions
    const canPerformSenderActions = currentUserDepartmentId === distribution.origin_department_id;
    const canPerformReceiverActions = currentUserDepartmentId === distribution.destination_department_id;

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
    const handleDocumentVerification = async () => {
        setIsLoading(true);
        try {
            let updatedDistribution: Distribution;

            if (verificationMode === 'sender') {
                updatedDistribution = await distributionService.verifySender(
                    distribution.id,
                    documentVerifications.map(v => ({ ...v, verified: true }))
                );
                toast.success('Documents verified by sender');
            } else {
                updatedDistribution = await distributionService.verifyReceiver(
                    distribution.id,
                    documentVerifications.map(v => ({ ...v, verified: true }))
                );
                toast.success('Documents verified by receiver');
            }

            onUpdate(updatedDistribution);
            setIsVerificationDialogOpen(false);
            setDocumentVerifications([]);
        } catch (error: any) {
            console.error('Document verification failed:', error);
            toast.error(error.message || 'Failed to verify documents');
        } finally {
            setIsLoading(false);
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {verificationMode === 'sender' ? 'Verify Documents (Sender)' : 'Verify Documents (Receiver)'}
                        </DialogTitle>
                        <DialogDescription>
                            Please verify each document before proceeding
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Document verification list */}
                        <div className="space-y-3">
                            {distribution.documents?.map((doc) => {
                                const isVerified = documentVerifications.some(
                                    v => v.document_type === doc.document_type && v.document_id === doc.document_id
                                );

                                return (
                                    <div key={`${doc.document_type}-${doc.document_id}`} className="flex items-center space-x-3 p-3 border rounded-lg">
                                        <Checkbox
                                            checked={isVerified}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setDocumentVerifications(prev => [...prev, {
                                                        document_type: doc.document_type,
                                                        document_id: doc.document_id
                                                    }]);
                                                } else {
                                                    setDocumentVerifications(prev =>
                                                        prev.filter(v =>
                                                            !(v.document_type === doc.document_type && v.document_id === doc.document_id)
                                                        )
                                                    );
                                                }
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {doc.document?.invoice_number || doc.document?.document_number || 'Unknown Document'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {doc.document_type === 'invoice' ? 'Invoice' : 'Additional Document'}
                                            </div>
                                        </div>
                                        {verificationMode === 'sender' && doc.sender_verified && (
                                            <Badge variant="secondary">Already Verified</Badge>
                                        )}
                                        {verificationMode === 'receiver' && doc.receiver_verified && (
                                            <Badge variant="secondary">Already Verified</Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsVerificationDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDocumentVerification}
                                disabled={isLoading || documentVerifications.length === 0}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Documents'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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