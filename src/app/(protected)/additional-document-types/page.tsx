"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Search, AlertCircle, LogIn, FileText } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AdditionalDocumentType, AdditionalDocumentTypeFormData } from "@/types/additional-document-type";
import { useAdditionalDocumentTypes } from "@/hooks/useAdditionalDocumentTypes";
import React from "react";

export default function AdditionalDocumentTypesPage() {
    const { status } = useSession();
    const {
        additionalDocumentTypes,
        loading,
        error,
        createAdditionalDocumentType,
        updateAdditionalDocumentType,
        deleteAdditionalDocumentType,
        clearError,
        isAuthenticated,
    } = useAdditionalDocumentTypes();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<AdditionalDocumentType | null>(null);
    const [deletingType, setDeletingType] = useState<AdditionalDocumentType | null>(null);
    const [formData, setFormData] = useState<AdditionalDocumentTypeFormData>({
        type_name: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Create document type handler
    const handleCreateDocumentType = async () => {
        setSubmitting(true);
        const success = await createAdditionalDocumentType(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Document type created successfully!");
        } else {
            toast.error("Failed to create document type. Please try again.");
        }
        setSubmitting(false);
    };

    // Update document type handler
    const handleUpdateDocumentType = async () => {
        if (!editingType) return;

        setSubmitting(true);
        const success = await updateAdditionalDocumentType(editingType.id, formData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingType(null);
            resetForm();
            toast.success("Document type updated successfully!");
        } else {
            toast.error("Failed to update document type. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete document type handler
    const handleDeleteDocumentType = async (id: number) => {
        setSubmitting(true);
        const success = await deleteAdditionalDocumentType(id);
        if (success) {
            toast.success("Document type deleted successfully!");
        } else {
            toast.error("Failed to delete document type. Please try again.");
        }
        setDeletingType(null);
        setSubmitting(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            type_name: "",
        });
    };

    // Handle edit
    const handleEdit = (type: AdditionalDocumentType) => {
        setEditingType(type);
        setFormData({
            type_name: type.type_name || "",
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (type: AdditionalDocumentType) => {
        setDeletingType(type);
        setIsDeleteDialogOpen(true);
    };

    // Filter document types based on search term
    const filteredDocumentTypes = React.useMemo(() => {
        if (!additionalDocumentTypes || !Array.isArray(additionalDocumentTypes)) {
            return [];
        }

        const search = (searchTerm || "").toLowerCase().trim();

        return additionalDocumentTypes.filter(type => {
            if (!type || typeof type !== 'object') return false;
            const typeName = type.type_name || "";
            return typeName.toLowerCase().includes(search);
        });
    }, [additionalDocumentTypes, searchTerm]);

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[350px]" />
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-[200px]" />
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
                                    You need to be logged in to access the document types page.
                                </p>
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

            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Additional Document Types</h1>
                        <p className="text-muted-foreground">
                            Manage additional document types for your system
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!isAuthenticated}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Document Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Create New Document Type</DialogTitle>
                                <DialogDescription>
                                    Add a new additional document type to your system.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type_name">Type Name *</Label>
                                    <Input
                                        id="type_name"
                                        value={formData.type_name}
                                        onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                                        placeholder="Enter document type name"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateDocumentType}
                                    disabled={!formData.type_name.trim() || submitting}
                                >
                                    {submitting ? "Creating..." : "Create Type"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search document types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            {/* Document Types Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        All Document Types
                    </CardTitle>
                    <CardDescription>
                        A list of all additional document types in your system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Type Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocumentTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            {searchTerm ? "No document types found matching your search." : "No document types found. Create your first document type!"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDocumentTypes.map((type, index) => (
                                        <TableRow key={type.id}>
                                            <TableCell>
                                                <Badge variant="secondary">{index + 1}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{type.id}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {type.type_name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(type)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(type)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Document Type</DialogTitle>
                        <DialogDescription>
                            Update the document type details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type_name">Type Name *</Label>
                            <Input
                                id="edit-type_name"
                                value={formData.type_name}
                                onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                                placeholder="Enter document type name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingType(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateDocumentType}
                            disabled={!formData.type_name.trim() || submitting}
                        >
                            {submitting ? "Updating..." : "Update Type"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Document Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the document type &ldquo;{deletingType?.type_name}&rdquo;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingType && (
                        <div className="py-4">
                            <div className="space-y-2 text-sm">
                                <p><strong>ID:</strong> {deletingType.id}</p>
                                <p><strong>Type Name:</strong> {deletingType.type_name}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingType(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingType) {
                                    handleDeleteDocumentType(deletingType.id);
                                }
                                setIsDeleteDialogOpen(false);
                            }}
                            disabled={submitting}
                        >
                            {submitting ? "Deleting..." : "Delete Type"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>
    );
} 