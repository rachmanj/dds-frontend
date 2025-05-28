'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, FileText, Receipt, X, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    Distribution,
    DistributionType,
    CreateDistributionRequest,
    UpdateDistributionRequest,
    DocumentType,
    DistributionWarning,
} from '@/types/distribution';
import { Department } from '@/types/department';
import { invoiceService, Invoice } from '@/lib/api/invoices';
import { additionalDocumentService, AdditionalDocument } from '@/lib/api/additional-documents';

// Form validation schema
const distributionSchema = z.object({
    document_type: z.enum(['invoice', 'additional_document'], {
        required_error: 'Document type is required',
    }),
    type_id: z.number().min(1, 'Distribution type is required'),
    origin_department_id: z.number().min(1, 'Origin department is required'),
    destination_department_id: z.number().min(1, 'Destination department is required'),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
}).refine((data) => {
    return data.origin_department_id !== data.destination_department_id;
}, {
    message: "Origin and destination departments must be different",
    path: ["destination_department_id"],
});

type FormData = z.infer<typeof distributionSchema>;

interface SelectedDocument {
    type: DocumentType;
    id: number;
    data: any; // Mixed types from different API modules - Invoice | AdditionalDocument
    auto_included?: boolean;
}

interface DistributionFormProps {
    initialData?: Distribution;
    distributionTypes: DistributionType[];
    departments: Department[];
    onSubmit: (data: CreateDistributionRequest | UpdateDistributionRequest) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
}

export function DistributionForm({
    initialData,
    distributionTypes,
    departments,
    onSubmit,
    onCancel,
    isEditing = false
}: DistributionFormProps) {
    // Initialize form first
    const form = useForm<FormData>({
        resolver: zodResolver(distributionSchema),
        defaultValues: {
            document_type: initialData?.document_type || undefined,
            type_id: initialData?.type_id || undefined,
            origin_department_id: initialData?.origin_department_id || undefined,
            destination_department_id: initialData?.destination_department_id || undefined,
            notes: initialData?.notes || '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocument[]>([]);
    const [autoIncludedDocuments, setAutoIncludedDocuments] = useState<SelectedDocument[]>([]);
    const [warnings, setWarnings] = useState<DistributionWarning[]>([]);
    const [availableInvoices, setAvailableInvoices] = useState<Invoice[]>([]);
    const [availableAdditionalDocs, setAvailableAdditionalDocs] = useState<AdditionalDocument[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    // Search states
    const [originDeptSearch, setOriginDeptSearch] = useState('');
    const [destinationDeptSearch, setDestinationDeptSearch] = useState('');
    const [documentSearch, setDocumentSearch] = useState('');

    // Watch document type to reload available documents
    const documentType = form.watch('document_type');

    // Sort departments by project then by name
    const sortedDepartments = [...departments].sort((a, b) => {
        if (a.project !== b.project) {
            return a.project.localeCompare(b.project);
        }
        return a.name.localeCompare(b.name);
    });

    // Filter departments based on search
    const filteredOriginDepartments = sortedDepartments.filter(dept =>
        dept.name.toLowerCase().includes(originDeptSearch.toLowerCase()) ||
        dept.project.toLowerCase().includes(originDeptSearch.toLowerCase()) ||
        dept.akronim.toLowerCase().includes(originDeptSearch.toLowerCase())
    );

    const filteredDestinationDepartments = sortedDepartments.filter(dept =>
        dept.name.toLowerCase().includes(destinationDeptSearch.toLowerCase()) ||
        dept.project.toLowerCase().includes(destinationDeptSearch.toLowerCase()) ||
        dept.akronim.toLowerCase().includes(destinationDeptSearch.toLowerCase())
    );

    // Load initial documents if editing
    useEffect(() => {
        if (initialData && isEditing) {
            const docs: SelectedDocument[] = [];

            // Add invoices
            initialData.invoices?.forEach(invoice => {
                docs.push({
                    type: 'invoice',
                    id: invoice.id,
                    data: invoice
                });
            });

            // Add additional documents
            initialData.additional_documents?.forEach(doc => {
                docs.push({
                    type: 'additional_document',
                    id: doc.id,
                    data: doc
                });
            });

            setSelectedDocuments(docs);
        }
    }, [initialData, isEditing]);

    // Load available documents based on document type
    const loadAvailableDocuments = async () => {
        if (!documentType) return;

        setLoadingDocuments(true);
        try {
            if (documentType === 'invoice') {
                const invoices = await invoiceService.getForDistribution({ search: documentSearch });
                setAvailableInvoices(invoices);
                setAvailableAdditionalDocs([]);
            } else {
                const additionalDocs = await additionalDocumentService.getForDistribution({ search: documentSearch });
                setAvailableAdditionalDocs(additionalDocs);
                setAvailableInvoices([]);
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoadingDocuments(false);
        }
    };

    // Reload documents when document type changes
    useEffect(() => {
        if (documentType) {
            // Clear selected documents when changing type
            setSelectedDocuments([]);
            setAutoIncludedDocuments([]);
            setWarnings([]);
            loadAvailableDocuments();
        }
    }, [documentType]);

    // Reload documents when search changes
    useEffect(() => {
        if (documentType) {
            const timeoutId = setTimeout(() => {
                loadAvailableDocuments();
            }, 300); // Debounce search

            return () => clearTimeout(timeoutId);
        }
    }, [documentSearch]);

    const handleSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            if (isEditing) {
                // For updates, only send the basic fields (documents are managed separately)
                const updateData: UpdateDistributionRequest = {
                    type_id: data.type_id,
                    destination_department_id: data.destination_department_id,
                    notes: data.notes,
                };
                await onSubmit(updateData);
            } else {
                // For creation, include documents and document type
                const createData: CreateDistributionRequest = {
                    document_type: data.document_type,
                    type_id: data.type_id,
                    origin_department_id: data.origin_department_id,
                    destination_department_id: data.destination_department_id,
                    notes: data.notes,
                    documents: selectedDocuments.map(doc => ({
                        type: doc.type,
                        id: doc.id
                    }))
                };
                await onSubmit(createData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const addDocument = (type: DocumentType, document: Invoice | AdditionalDocument) => {
        const isAlreadySelected = selectedDocuments.some(
            doc => doc.type === type && doc.id === document.id
        );

        if (!isAlreadySelected) {
            const newDoc: SelectedDocument = {
                type,
                id: document.id,
                data: document
            };

            setSelectedDocuments(prev => [...prev, newDoc]);

            // If adding an invoice, simulate auto-inclusion logic for preview
            if (type === 'invoice' && 'additionalDocuments' in document && document.additionalDocuments) {
                const autoIncluded: SelectedDocument[] = [];
                const newWarnings: DistributionWarning[] = [];

                document.additionalDocuments.forEach((attachedDoc: AdditionalDocument) => {
                    // For demo purposes, assume some documents have location mismatch
                    if (Math.random() > 0.7) { // 30% chance of location mismatch
                        newWarnings.push({
                            type: 'location_mismatch',
                            message: `Additional document ${attachedDoc.document_number} attached to invoice ${document.invoice_number} has different location. It will not be included in the distribution.`,
                            document_type: 'additional_document',
                            document_id: attachedDoc.id,
                            document_number: attachedDoc.document_number
                        });
                    } else {
                        autoIncluded.push({
                            type: 'additional_document',
                            id: attachedDoc.id,
                            data: attachedDoc,
                            auto_included: true
                        });
                    }
                });

                setAutoIncludedDocuments(prev => [...prev, ...autoIncluded]);
                setWarnings(prev => [...prev, ...newWarnings]);
            }
        }
    };

    const removeDocument = (type: DocumentType, id: number) => {
        setSelectedDocuments(prev =>
            prev.filter(doc => !(doc.type === type && doc.id === id))
        );

        // If removing an invoice, also remove its auto-included documents
        if (type === 'invoice') {
            setAutoIncludedDocuments(prev => prev.filter(_doc => {
                // Remove auto-included docs that belong to this invoice
                // This is a simplified logic - in real implementation, you'd track the relationship
                return true; // For now, keep all auto-included docs
            }));
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
            month: 'short',
            day: 'numeric',
        });
    };

    const allDocuments = [...selectedDocuments, ...autoIncludedDocuments];

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Document Type Selection */}
                    {!isEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Document Type</CardTitle>
                                <CardDescription>
                                    Choose what type of documents you want to distribute
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="document_type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex flex-col space-y-2"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="invoice" id="invoice" />
                                                        <label htmlFor="invoice" className="flex items-center space-x-2 cursor-pointer">
                                                            <Receipt className="h-4 w-4 text-blue-500" />
                                                            <div>
                                                                <div className="font-medium">Invoices</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Distribute invoices (attached additional documents will be auto-included)
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="additional_document" id="additional_document" />
                                                        <label htmlFor="additional_document" className="flex items-center space-x-2 cursor-pointer">
                                                            <FileText className="h-4 w-4 text-green-500" />
                                                            <div>
                                                                <div className="font-medium">Additional Documents Only</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Distribute additional documents only
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribution Information</CardTitle>
                            <CardDescription>
                                Basic information about the distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Distribution Type */}
                            <FormField
                                control={form.control}
                                name="type_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Distribution Type</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select distribution type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {distributionTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className="w-3 h-3 rounded"
                                                                style={{ backgroundColor: type.color }}
                                                            />
                                                            <span>{type.name}</span>
                                                            <Badge variant="outline">{type.code}</Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select the priority and type of this distribution
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Origin Department */}
                            <FormField
                                control={form.control}
                                name="origin_department_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Department</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select origin department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60">
                                                <div className="p-2 border-b">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search departments..."
                                                            value={originDeptSearch}
                                                            onChange={(e) => setOriginDeptSearch(e.target.value)}
                                                            className="pl-8 h-8"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredOriginDepartments.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No departments found
                                                        </div>
                                                    ) : (
                                                        filteredOriginDepartments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                <div>
                                                                    <div className="font-medium">{dept.name}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {dept.project} - {dept.akronim} - {dept.location_code}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Department sending the documents
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Destination Department */}
                            <FormField
                                control={form.control}
                                name="destination_department_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Department</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select destination department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60">
                                                <div className="p-2 border-b">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search departments..."
                                                            value={destinationDeptSearch}
                                                            onChange={(e) => setDestinationDeptSearch(e.target.value)}
                                                            className="pl-8 h-8"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto">
                                                    {filteredDestinationDepartments.length === 0 ? (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No departments found
                                                        </div>
                                                    ) : (
                                                        filteredDestinationDepartments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                <div>
                                                                    <div className="font-medium">{dept.name}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {dept.project} - {dept.akronim} - {dept.location_code}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Department receiving the documents
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Optional notes about this distribution..."
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Additional information about this distribution (max 1000 characters)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Document Selection */}
                    {documentType && !isEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    {documentType === 'invoice' ? (
                                        <Receipt className="h-5 w-5 text-blue-500" />
                                    ) : (
                                        <FileText className="h-5 w-5 text-green-500" />
                                    )}
                                    <span>
                                        Select {documentType === 'invoice' ? 'Invoices' : 'Additional Documents'}
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    Choose the documents to include in this distribution
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search ${documentType === 'invoice' ? 'invoices' : 'additional documents'}...`}
                                        value={documentSearch}
                                        onChange={(e) => setDocumentSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                {/* Document Selection */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">Available Documents</h4>
                                        <Badge variant="outline">
                                            {documentType === 'invoice' ? availableInvoices.length : availableAdditionalDocs.length} available
                                        </Badge>
                                    </div>

                                    {loadingDocuments ? (
                                        <div className="text-center py-4 text-muted-foreground">
                                            Loading documents...
                                        </div>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto border rounded-md">
                                            {documentType === 'invoice' ? (
                                                availableInvoices.length === 0 ? (
                                                    <div className="p-4 text-center text-muted-foreground">
                                                        No invoices found in your location
                                                    </div>
                                                ) : (
                                                    availableInvoices.map((invoice) => (
                                                        <div
                                                            key={invoice.id}
                                                            className="p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                                            onClick={() => addDocument('invoice', invoice)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{invoice.invoice_number}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {invoice.supplier?.name} • {formatDate(invoice.invoice_date)}
                                                                        {invoice.amount && invoice.currency && (
                                                                            <span> • {formatCurrency(invoice.amount, invoice.currency)}</span>
                                                                        )}
                                                                    </div>
                                                                    {invoice.has_location_mismatch && (
                                                                        <div className="text-xs text-amber-600 mt-1">
                                                                            ⚠️ Some attached documents have location mismatch
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={selectedDocuments.some(doc => doc.type === 'invoice' && doc.id === invoice.id)}
                                                                >
                                                                    {selectedDocuments.some(doc => doc.type === 'invoice' && doc.id === invoice.id) ? 'Added' : 'Add'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                            ) : (
                                                availableAdditionalDocs.length === 0 ? (
                                                    <div className="p-4 text-center text-muted-foreground">
                                                        No additional documents found in your location
                                                    </div>
                                                ) : (
                                                    availableAdditionalDocs.map((doc) => (
                                                        <div
                                                            key={doc.id}
                                                            className="p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                                            onClick={() => addDocument('additional_document', doc)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{doc.document_number}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {doc.type?.type_name} • {formatDate(doc.document_date)}
                                                                        {doc.remarks && <span> • {doc.remarks}</span>}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={selectedDocuments.some(d => d.type === 'additional_document' && d.id === doc.id)}
                                                                >
                                                                    {selectedDocuments.some(d => d.type === 'additional_document' && d.id === doc.id) ? 'Added' : 'Add'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Selected Documents */}
                    {allDocuments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Selected Documents</CardTitle>
                                <CardDescription>
                                    Documents that will be included in this distribution
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {allDocuments.map((doc) => (
                                        <div
                                            key={`${doc.type}-${doc.id}`}
                                            className="flex items-center justify-between p-3 border rounded-md"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {doc.type === 'invoice' ? (
                                                    <Receipt className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <FileText className="h-4 w-4 text-green-500" />
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        {doc.type === 'invoice' ? doc.data.invoice_number : doc.data.document_number}
                                                        {doc.auto_included && (
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                Auto-included
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {doc.type === 'invoice' ? (
                                                            <>
                                                                {doc.data.supplier?.name} • {formatDate(doc.data.invoice_date)}
                                                                {doc.data.amount && doc.data.currency && (
                                                                    <span> • {formatCurrency(doc.data.amount, doc.data.currency)}</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {doc.data.type?.type_name} • {formatDate(doc.data.document_date)}
                                                                {doc.data.remarks && <span> • {doc.data.remarks}</span>}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {!doc.auto_included && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDocument(doc.type, doc.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Warnings */}
                    {warnings.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-2">
                                    <div className="font-medium">Location Warnings:</div>
                                    {warnings.map((warning, index) => (
                                        <div key={index} className="text-sm">
                                            • {warning.message}
                                        </div>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Auto-included Documents Info */}
                    {autoIncludedDocuments.length > 0 && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-2">
                                    <div className="font-medium">Auto-included Documents:</div>
                                    <div className="text-sm">
                                        {autoIncludedDocuments.length} additional document(s) will be automatically included with the selected invoices.
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || (!isEditing && allDocuments.length === 0)}
                        >
                            {isSubmitting ? 'Saving...' : isEditing ? 'Update Distribution' : 'Create Distribution'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 