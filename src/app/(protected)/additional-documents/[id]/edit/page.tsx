"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, LogIn, Save } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AdditionalDocument, AdditionalDocumentFormData } from "@/types/additional-document";
import { useAdditionalDocuments } from "@/hooks/useAdditionalDocuments";
import { useAdditionalDocumentTypes } from "@/hooks/useAdditionalDocumentTypes";
import { useDepartments } from "@/hooks/useDepartments";

export default function EditAdditionalDocumentPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params.id as string;
    const { status } = useSession();
    const {
        additionalDocuments,
        updateAdditionalDocument,
        isAuthenticated,
        loading: documentsLoading,
    } = useAdditionalDocuments();

    const { additionalDocumentTypes } = useAdditionalDocumentTypes();
    const { departments } = useDepartments();

    const [editingDocument, setEditingDocument] = useState<AdditionalDocument | null>(null);
    const [formData, setFormData] = useState<AdditionalDocumentFormData>({
        type_id: 0,
        document_number: "",
        document_date: "",
        po_no: "",
        receive_date: "",
        remarks: "",
        cur_loc: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // State for searchable selects
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
    const [typeSearchTerm, setTypeSearchTerm] = useState("");

    // Load document data when component mounts
    useEffect(() => {
        if (!documentsLoading && additionalDocuments.length > 0 && documentId) {
            const document = additionalDocuments.find(doc => doc.id.toString() === documentId);
            if (document) {
                setEditingDocument(document);

                // Format date to YYYY-MM-DD for HTML date input
                const formatDateForInput = (dateString: string) => {
                    if (!dateString) return "";
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                };

                const editFormData = {
                    type_id: document.type?.id || document.type_id || 0,
                    document_number: document.document_number,
                    document_date: formatDateForInput(document.document_date),
                    po_no: document.po_no || "",
                    receive_date: document.receive_date ? formatDateForInput(document.receive_date) : "",
                    remarks: document.remarks || "",
                    cur_loc: document.cur_loc || "",
                };

                setFormData(editFormData);
                setLoading(false);
            } else {
                // Document not found
                toast.error("Additional document not found");
                router.push("/additional-documents");
            }
        }
    }, [documentsLoading, additionalDocuments, documentId, router]);

    // Sort departments by project for consistent ordering
    const sortedDepartments = useMemo(() => {
        return [...departments].sort((a, b) => {
            if (a.project !== b.project) {
                return a.project.localeCompare(b.project);
            }
            return a.name.localeCompare(b.name);
        });
    }, [departments]);

    // Filter departments based on search term
    const filteredDepartments = useMemo(() => {
        if (!departmentSearchTerm) return sortedDepartments;
        return sortedDepartments.filter(department =>
            department.name.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
            department.project.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
            department.location_code.toLowerCase().includes(departmentSearchTerm.toLowerCase())
        );
    }, [sortedDepartments, departmentSearchTerm]);

    // Filter document types based on search term
    const filteredDocumentTypes = useMemo(() => {
        if (!typeSearchTerm) return additionalDocumentTypes;
        return additionalDocumentTypes.filter(type =>
            type.type_name.toLowerCase().includes(typeSearchTerm.toLowerCase())
        );
    }, [additionalDocumentTypes, typeSearchTerm]);

    // Helper function to get department option display format
    const getDepartmentOptionDisplay = (department: { project: string; name: string; location_code: string }) => {
        return `${department.project} - ${department.name} - ${department.location_code}`;
    };

    const handleSubmit = async () => {
        if (!editingDocument) return;

        setSubmitting(true);
        const success = await updateAdditionalDocument(editingDocument.id, formData);
        if (success) {
            toast.success("Additional document updated successfully!");
            router.push("/additional-documents");
        } else {
            toast.error("Failed to update additional document. Please try again.");
        }
        setSubmitting(false);
    };

    const handleCancel = () => {
        router.push("/additional-documents");
    };

    // Show loading state while checking authentication or loading document
    if (status === "loading" || loading) {
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
                                    You need to be logged in to edit additional documents.
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

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Additional Documents
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Additional Document</h1>
                    <p className="text-muted-foreground">
                        Update the document details
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Information</CardTitle>
                    <CardDescription>
                        Update the details for this additional document
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type_id">Document Type *</Label>
                                <Select
                                    key={`edit-type-${editingDocument?.id || 'new'}`}
                                    value={formData.type_id ? formData.type_id.toString() : ""}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, type_id: parseInt(value) })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select document type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 border-b">
                                            <Input
                                                placeholder="Search document types..."
                                                value={typeSearchTerm}
                                                onChange={(e) => setTypeSearchTerm(e.target.value)}
                                                className="h-8"
                                            />
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto">
                                            {filteredDocumentTypes.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No document types found
                                                </div>
                                            ) : (
                                                filteredDocumentTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.type_name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="document_number">Document Number *</Label>
                                <Input
                                    id="document_number"
                                    value={formData.document_number}
                                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                                    placeholder="Enter document number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Date Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="document_date">Document Date *</Label>
                                <Input
                                    id="document_date"
                                    type="date"
                                    value={formData.document_date}
                                    onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="receive_date">Receive Date</Label>
                                <Input
                                    id="receive_date"
                                    type="date"
                                    value={formData.receive_date}
                                    onChange={(e) => setFormData({ ...formData, receive_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project and PO Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">PO Information</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="po_no">PO Number</Label>
                            <Input
                                id="po_no"
                                value={formData.po_no}
                                onChange={(e) => setFormData({ ...formData, po_no: e.target.value })}
                                placeholder="Enter PO number"
                            />
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Location Information</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="cur_loc">Current Location</Label>
                            <Select
                                key={`edit-dept-${editingDocument?.id || 'new'}`}
                                value={formData.cur_loc || ""}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, cur_loc: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select current location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2 border-b">
                                        <Input
                                            placeholder="Search departments..."
                                            value={departmentSearchTerm}
                                            onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {filteredDepartments.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No departments found
                                            </div>
                                        ) : (
                                            filteredDepartments.map((department) => (
                                                <SelectItem key={department.id} value={department.location_code}>
                                                    {getDepartmentOptionDisplay(department)}
                                                </SelectItem>
                                            ))
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Additional Information</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={formData.remarks}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Enter remarks"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!formData.type_id || !formData.document_number || !formData.document_date || submitting}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {submitting ? "Updating..." : "Update Document"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Toaster />
        </div>
    );
} 