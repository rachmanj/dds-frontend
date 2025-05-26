"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useInvoiceAdditionalDocuments } from "@/hooks/useInvoiceAdditionalDocuments";
import { useAdditionalDocuments } from "@/hooks/useAdditionalDocuments";
import { AdditionalDocument } from "@/types/additional-document";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface InvoiceAdditionalDocumentsProps {
    invoiceId: number;
    invoiceNumber: string;
}

export function InvoiceAdditionalDocuments({
    invoiceId,
    invoiceNumber,
}: InvoiceAdditionalDocumentsProps) {
    const {
        getInvoiceAdditionalDocuments,
        attachAdditionalDocument,
        detachAdditionalDocument,
        loading: relationshipLoading,
        error: relationshipError,
    } = useInvoiceAdditionalDocuments();

    const {
        additionalDocuments: allAdditionalDocuments,
        loading: documentsLoading,
    } = useAdditionalDocuments();

    const [attachedDocuments, setAttachedDocuments] = useState<AdditionalDocument[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
    const [animatingDocuments, setAnimatingDocuments] = useState<Set<number>>(new Set());

    // Format date to dd-mmm-yyyy
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Get related invoices info for a document
    const getRelatedInvoicesInfo = (doc: AdditionalDocument) => {
        if (!doc.invoices || doc.invoices.length === 0) return null;

        // Filter out the current invoice
        const otherInvoices = doc.invoices.filter(inv => inv.id !== invoiceId);
        if (otherInvoices.length === 0) return null;

        return otherInvoices.map(inv => ({
            invoiceNumber: inv.invoice_number,
            supplierName: inv.supplier?.name || 'Unknown Supplier'
        }));
    };

    // Load attached documents when component mounts
    useEffect(() => {
        const loadAttachedDocuments = async () => {
            const documents = await getInvoiceAdditionalDocuments(invoiceId);
            setAttachedDocuments(documents);
        };

        loadAttachedDocuments();
    }, [invoiceId, getInvoiceAdditionalDocuments]);

    // Get available documents (not already attached)
    const availableDocuments = useMemo(() => {
        return allAdditionalDocuments.filter(
            (doc) => !attachedDocuments.some((attached) => attached.id === doc.id)
        );
    }, [allAdditionalDocuments, attachedDocuments]);

    // Filter documents based on search term
    const filteredDocuments = useMemo(() => {
        if (!searchTerm) return availableDocuments;

        const term = searchTerm.toLowerCase();
        return availableDocuments.filter((doc) => {
            return (
                doc.document_number?.toLowerCase().includes(term) ||
                doc.po_no?.toLowerCase().includes(term) ||
                doc.type?.type_name?.toLowerCase().includes(term) ||
                doc.cur_loc?.toLowerCase().includes(term) ||
                doc.remarks?.toLowerCase().includes(term)
            );
        });
    }, [availableDocuments, searchTerm]);

    const getDocumentDisplayLabel = (doc: AdditionalDocument) => {
        const parts = [doc.document_number];
        if (doc.type?.type_name) parts.push(`(${doc.type.type_name})`);
        if (doc.po_no) parts.push(`• PO: ${doc.po_no}`);
        if (doc.cur_loc) parts.push(`• Loc: ${doc.cur_loc}`);
        return parts.join(" ");
    };

    const handleDocumentSelection = (documentId: number, checked: boolean) => {
        if (checked) {
            setSelectedDocumentIds(prev => [...prev, documentId]);
        } else {
            setSelectedDocumentIds(prev => prev.filter(id => id !== documentId));
        }
    };

    const handleAttachSelectedDocuments = async () => {
        if (selectedDocumentIds.length === 0) return;

        let successCount = 0;
        let failedCount = 0;

        // Add animation state for selected documents
        setAnimatingDocuments(new Set(selectedDocumentIds));

        for (const documentId of selectedDocumentIds) {
            const success = await attachAdditionalDocument(invoiceId, documentId);
            if (success) {
                successCount++;
            } else {
                failedCount++;
            }
        }

        // Clear animation state
        setAnimatingDocuments(new Set());

        if (successCount > 0) {
            // Reload attached documents
            const documents = await getInvoiceAdditionalDocuments(invoiceId);
            setAttachedDocuments(documents);
            setSelectedDocumentIds([]);
            setSearchTerm("");
            setIsModalOpen(false);

            // Show success toast
            if (successCount === 1) {
                toast.success("Document attached successfully!");
            } else {
                toast.success(`${successCount} documents attached successfully!`);
            }
        }

        if (failedCount > 0) {
            if (failedCount === 1) {
                toast.error("Failed to attach 1 document. Please try again.");
            } else {
                toast.error(`Failed to attach ${failedCount} documents. Please try again.`);
            }
        }
    };

    const handleDetachDocument = async (documentId: number) => {
        // Add animation state
        setAnimatingDocuments(prev => new Set([...prev, documentId]));

        const success = await detachAdditionalDocument(invoiceId, documentId);

        if (success) {
            // Show success toast
            toast.success("Document detached successfully!");

            // Wait for animation before removing from state
            setTimeout(() => {
                setAttachedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
                setAnimatingDocuments(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(documentId);
                    return newSet;
                });
            }, 300);
        } else {
            // Remove animation state on failure
            setAnimatingDocuments(prev => {
                const newSet = new Set(prev);
                newSet.delete(documentId);
                return newSet;
            });
            toast.error("Failed to detach document. Please try again.");
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedDocumentIds([]);
        setSearchTerm("");
    };

    if (documentsLoading || relationshipLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Additional Documents for Invoice {invoiceNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {relationshipError && (
                    <div className="text-red-600 text-sm">{relationshipError}</div>
                )}

                {/* Add new document button */}
                <div className="flex justify-start">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={relationshipLoading || availableDocuments.length === 0}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Documents
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Select Additional Documents</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                                {/* Search input */}
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search Documents</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search by document number, PO number, type, or location..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Documents list */}
                                <div className="flex-1 overflow-y-auto border rounded-lg">
                                    {filteredDocuments.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            {searchTerm ? "No documents found matching your search" : "No available documents to attach"}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 p-4">
                                            {filteredDocuments.map((doc) => {
                                                const relatedInvoices = getRelatedInvoicesInfo(doc);
                                                const isAnimating = animatingDocuments.has(doc.id);
                                                return (
                                                    <div
                                                        key={doc.id}
                                                        className={`flex items-start space-x-3 p-3 border rounded-lg transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                                                            }`}
                                                    >
                                                        <Checkbox
                                                            id={`doc-${doc.id}`}
                                                            checked={selectedDocumentIds.includes(doc.id)}
                                                            onCheckedChange={(checked: boolean) =>
                                                                handleDocumentSelection(doc.id, checked)
                                                            }
                                                            className="mt-1"
                                                            disabled={isAnimating}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <label
                                                                htmlFor={`doc-${doc.id}`}
                                                                className="block cursor-pointer"
                                                            >
                                                                <div className="font-medium text-sm">
                                                                    {getDocumentDisplayLabel(doc)}
                                                                </div>
                                                                <div className="text-xs text-gray-600 mt-1">
                                                                    Date: {formatDate(doc.document_date)} • Status: {doc.status}
                                                                </div>
                                                                {relatedInvoices && relatedInvoices.length > 0 && (
                                                                    <div className="text-xs text-blue-600 mt-1">
                                                                        Also attached to: {relatedInvoices.map(inv =>
                                                                            `${inv.invoiceNumber} (${inv.supplierName})`
                                                                        ).join(', ')}
                                                                    </div>
                                                                )}
                                                                {doc.remarks && (
                                                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                                                        {doc.remarks}
                                                                    </div>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                    <Button variant="outline" onClick={handleModalClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAttachSelectedDocuments}
                                        disabled={selectedDocumentIds.length === 0 || relationshipLoading || animatingDocuments.size > 0}
                                    >
                                        {animatingDocuments.size > 0 ? "Attaching..." : `Attach ${selectedDocumentIds.length > 0 ? `(${selectedDocumentIds.length})` : ""} Documents`}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* List attached documents */}
                <div className="space-y-2">
                    <h4 className="font-medium">Attached Documents ({attachedDocuments.length})</h4>
                    {attachedDocuments.length === 0 ? (
                        <p className="text-gray-500 text-sm">No additional documents attached</p>
                    ) : (
                        <div className="space-y-2">
                            {attachedDocuments.map((doc) => {
                                const relatedInvoices = getRelatedInvoicesInfo(doc);
                                const isAnimating = animatingDocuments.has(doc.id);
                                return (
                                    <div
                                        key={doc.id}
                                        className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95 bg-red-50' : 'opacity-100 scale-100'
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{doc.document_number}</div>
                                            <div className="text-sm text-gray-600">
                                                {doc.type?.type_name} • {formatDate(doc.document_date)}
                                                {doc.po_no && ` • PO: ${doc.po_no}`}
                                                {doc.cur_loc && ` • Loc: ${doc.cur_loc}`}
                                            </div>
                                            {relatedInvoices && relatedInvoices.length > 0 && (
                                                <div className="text-sm text-blue-600 mt-1">
                                                    Also attached to: {relatedInvoices.map(inv =>
                                                        `${inv.invoiceNumber} (${inv.supplierName})`
                                                    ).join(', ')}
                                                </div>
                                            )}
                                            {doc.remarks && (
                                                <div className="text-sm text-gray-500 mt-1">{doc.remarks}</div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{doc.status}</Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDetachDocument(doc.id)}
                                                disabled={relationshipLoading || isAnimating}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 