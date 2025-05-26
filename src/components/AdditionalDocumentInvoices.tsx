"use client";

import React, { useState, useEffect } from "react";
import { useAdditionalDocumentInvoices } from "@/hooks/useAdditionalDocumentInvoices";
import { useInvoices } from "@/hooks/useInvoices";
import { Invoice } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AdditionalDocumentInvoicesProps {
    additionalDocumentId: number;
    documentNumber: string;
}

export function AdditionalDocumentInvoices({
    additionalDocumentId,
    documentNumber,
}: AdditionalDocumentInvoicesProps) {
    const {
        getAdditionalDocumentInvoices,
        attachInvoice,
        detachInvoice,
        loading: relationshipLoading,
        error: relationshipError,
    } = useAdditionalDocumentInvoices();

    const {
        invoices: allInvoices,
        loading: invoicesLoading,
    } = useInvoices();

    const [attachedInvoices, setAttachedInvoices] = useState<Invoice[]>([]);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");

    // Load attached invoices when component mounts
    useEffect(() => {
        const loadAttachedInvoices = async () => {
            const invoices = await getAdditionalDocumentInvoices(additionalDocumentId);
            setAttachedInvoices(invoices);
        };

        loadAttachedInvoices();
    }, [additionalDocumentId, getAdditionalDocumentInvoices]);

    // Get available invoices (not already attached)
    const availableInvoices = allInvoices.filter(
        (invoice) => !attachedInvoices.some((attached) => attached.id === invoice.id)
    );

    const handleAttachInvoice = async () => {
        if (!selectedInvoiceId) return;

        const success = await attachInvoice(additionalDocumentId, parseInt(selectedInvoiceId));
        if (success) {
            // Reload attached invoices
            const invoices = await getAdditionalDocumentInvoices(additionalDocumentId);
            setAttachedInvoices(invoices);
            setSelectedInvoiceId("");
        }
    };

    const handleDetachInvoice = async (invoiceId: number) => {
        const success = await detachInvoice(additionalDocumentId, invoiceId);
        if (success) {
            // Remove from local state
            setAttachedInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
        }
    };

    if (invoicesLoading || relationshipLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoices for Document {documentNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {relationshipError && (
                    <div className="text-red-600 text-sm">{relationshipError}</div>
                )}

                {/* Add new invoice */}
                <div className="flex gap-2">
                    <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select invoice to attach" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableInvoices.map((invoice) => (
                                <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                    {invoice.invoice_number} - {invoice.supplier?.name} ({invoice.currency} {invoice.amount})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleAttachInvoice}
                        disabled={!selectedInvoiceId || relationshipLoading}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Attach
                    </Button>
                </div>

                {/* List attached invoices */}
                <div className="space-y-2">
                    <h4 className="font-medium">Attached Invoices ({attachedInvoices.length})</h4>
                    {attachedInvoices.length === 0 ? (
                        <p className="text-gray-500 text-sm">No invoices attached</p>
                    ) : (
                        <div className="space-y-2">
                            {attachedInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{invoice.invoice_number}</div>
                                        <div className="text-sm text-gray-600">
                                            {invoice.supplier?.name} • {invoice.invoice_date}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {invoice.currency} {invoice.amount}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{invoice.status}</Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDetachInvoice(invoice.id)}
                                            disabled={relationshipLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 