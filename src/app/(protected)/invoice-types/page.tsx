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
import { Plus, Edit, Trash2, Search, AlertCircle, LogIn, Receipt } from "lucide-react";
import { toast, Toaster } from "sonner";
import { InvoiceType, InvoiceTypeFormData } from "@/types/invoice-type";
import { useInvoiceTypes } from "@/hooks/useInvoiceTypes";

export default function InvoiceTypesPage() {
    const { status } = useSession();
    const {
        invoiceTypes,
        loading,
        error,
        createInvoiceType,
        updateInvoiceType,
        deleteInvoiceType,
        clearError,
        isAuthenticated,
    } = useInvoiceTypes();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<InvoiceType | null>(null);
    const [deletingType, setDeletingType] = useState<InvoiceType | null>(null);
    const [formData, setFormData] = useState<InvoiceTypeFormData>({
        type_name: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Create invoice type handler
    const handleCreateInvoiceType = async () => {
        setSubmitting(true);
        const success = await createInvoiceType(formData);
        if (success) {
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Invoice type created successfully!");
        } else {
            toast.error("Failed to create invoice type. Please try again.");
        }
        setSubmitting(false);
    };

    // Update invoice type handler
    const handleUpdateInvoiceType = async () => {
        if (!editingType) return;

        setSubmitting(true);
        const success = await updateInvoiceType(editingType.id, formData);
        if (success) {
            setIsEditDialogOpen(false);
            setEditingType(null);
            resetForm();
            toast.success("Invoice type updated successfully!");
        } else {
            toast.error("Failed to update invoice type. Please try again.");
        }
        setSubmitting(false);
    };

    // Delete invoice type handler
    const handleDeleteInvoiceType = async (id: number) => {
        setSubmitting(true);
        const success = await deleteInvoiceType(id);
        if (success) {
            toast.success("Invoice type deleted successfully!");
        } else {
            toast.error("Failed to delete invoice type. Please try again.");
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
    const handleEdit = (type: InvoiceType) => {
        setEditingType(type);
        setFormData({
            type_name: type.type_name,
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete confirmation
    const handleDeleteClick = (type: InvoiceType) => {
        setDeletingType(type);
        setIsDeleteDialogOpen(true);
    };

    // Filter invoice types based on search term
    const filteredInvoiceTypes = invoiceTypes.filter(type =>
        type.type_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                    You need to be logged in to access the invoice types page.
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
                        <h1 className="text-3xl font-bold tracking-tight">Invoice Types</h1>
                        <p className="text-muted-foreground">
                            Manage invoice types for your billing system
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!isAuthenticated}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Invoice Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Create New Invoice Type</DialogTitle>
                                <DialogDescription>
                                    Add a new invoice type to your billing system.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type_name">Type Name *</Label>
                                    <Input
                                        id="type_name"
                                        value={formData.type_name}
                                        onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                                        placeholder="Enter invoice type name"
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
                                    onClick={handleCreateInvoiceType}
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
                            placeholder="Search invoice types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            {/* Invoice Types Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        All Invoice Types
                    </CardTitle>
                    <CardDescription>
                        A list of all invoice types in your billing system.
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
                                {filteredInvoiceTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            {searchTerm ? "No invoice types found matching your search." : "No invoice types found. Create your first invoice type!"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvoiceTypes.map((type, index) => (
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
                        <DialogTitle>Edit Invoice Type</DialogTitle>
                        <DialogDescription>
                            Update the invoice type details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type_name">Type Name *</Label>
                            <Input
                                id="edit-type_name"
                                value={formData.type_name}
                                onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                                placeholder="Enter invoice type name"
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
                            onClick={handleUpdateInvoiceType}
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
                        <DialogTitle>Delete Invoice Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the invoice type &ldquo;{deletingType?.type_name}&rdquo;? This action cannot be undone.
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
                                    handleDeleteInvoiceType(deletingType.id);
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